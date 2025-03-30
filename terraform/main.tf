terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  cloud {
    organization = "kusama"

    workspaces {
      name = "pd-challenge-cup-app-teamx"
      project = "PagerDuty Challenge Cup"
    }
  }
  required_version = ">= 1.2.0"
}
provider "aws" {
  region = "ap-northeast-1"
}

// データソース - 既存のVPC
data "aws_vpc" "existing" {
  filter {
    name   = "tag:Name"
    values = ["challenge-cup-vpc"]
  }
}

// データソース - 既存のプライベートサブネット
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing.id]
  }
  filter {
    name   = "tag:Name"
    values = ["challenge-cup-private-*"]
  }
}

variable "team_name" {
  type    = string
  default = "teamx"
}

// データソース - 既存のEKSクラスター
data "aws_eks_cluster" "existing" {
  name = "challenge-cup-cluster"
}

// データソース - 既存のセキュリティグループ
data "aws_security_group" "eks" {
  name   = "challenge-cup-sg"
  vpc_id = data.aws_vpc.existing.id
}

// データソース - EKSクラスターのセキュリティグループ
data "aws_eks_cluster" "cluster_sg" {
  name = "challenge-cup-cluster"
}

// RDS MySQL Subnet Group
resource "aws_db_subnet_group" "mysql" {
  name       = "challenge-cup-mysql-subnet-group"
  subnet_ids = data.aws_subnets.private.ids

  tags = {
    Name = "challenge-cup-mysql-subnet-group"
  }
}

// Security Group for RDS MySQL
resource "aws_security_group" "rds_access" {
  name        = "challenge-cup-rds-access-${var.team_name}"
  description = "Allow RDS MySQL access from EKS cluster for ${var.team_name}"
  vpc_id      = data.aws_vpc.existing.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    #security_groups = [data.aws_security_group.eks.id, data.aws_eks_cluster.cluster_sg.vpc_config[0].cluster_security_group_id]
    security_groups = []
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "challenge-cup-rds-access-${var.team_name}"
  }
}

// RDS MySQL Instance
resource "aws_db_instance" "mysql" {
  allocated_storage      = 20
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  db_name                = "challengecupdb_${var.team_name}"
  username               = "admin"
  password               = random_password.db_password.result
  parameter_group_name   = "default.mysql8.0"
  skip_final_snapshot    = true
  db_subnet_group_name   = aws_db_subnet_group.mysql.name
  vpc_security_group_ids = [aws_security_group.rds_access.id]
  multi_az               = false
  publicly_accessible    = false
  identifier             = "challenge-cup-mysql-${var.team_name}"

  tags = {
    Name = "challenge-cup-mysql-${var.team_name}"
  }
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}

output "db_password" {
  description = "RDSのMySQLインスタンスのパスワード"
  value       = random_password.db_password.result
  sensitive   = true
}

output "rds_endpoint" {
  description = "RDSのMySQLインスタンスのエンドポイント"
  value       = aws_db_instance.mysql.address
}

output "rds_port" {
  description = "RDSのMySQLインスタンスのポート"
  value       = aws_db_instance.mysql.port
}

output "database_name" {
  description = "データベース名"
  value       = aws_db_instance.mysql.db_name
}

output "database_username" {
  description = "データベースのマスターユーザー名"
  value       = aws_db_instance.mysql.username
  sensitive   = true
}

// Kubernetes Secret for Database Credentials
resource "kubernetes_secret" "database_credentials" {
  metadata {
    name      = "database-credentials"
    namespace = var.team_name
  }

  data = {
    url = "mysql://${aws_db_instance.mysql.username}:${aws_db_instance.mysql.password}@${aws_db_instance.mysql.address}:${aws_db_instance.mysql.port}/${aws_db_instance.mysql.db_name}"
  }
}

data "aws_eks_cluster" "cluster" {
  name = "challenge-cup-cluster"
}

data "aws_eks_cluster_auth" "cluster_auth" {
  name = data.aws_eks_cluster.cluster.name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster_auth.token
}
