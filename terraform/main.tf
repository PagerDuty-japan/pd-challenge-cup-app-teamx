terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "ap-northeast-1"
  profile = "pagerduty"
}

resource "aws_budgets_budget" "monthly_cost" {
  name              = "monthly-cost-limit"
  budget_type       = "COST"
  limit_amount      = "370"
  limit_unit        = "USD"
  time_period_start = "2025-02-01_00:00"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["kkusama@pagerduty.com"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["kkusama@pagerduty.com"]
  }
}

# Frontend ECRリポジトリ
resource "aws_ecr_repository" "frontend" {
  name = "challenge-cup-frontend"
  force_delete = true  # リソース削除時にイメージも強制削除

  image_tag_mutability = "MUTABLE"  # タグの上書きを許可

  encryption_configuration {
    encryption_type = "AES256"  # デフォルトの暗号化を使用
  }
}

# Backend ECRリポジトリ
resource "aws_ecr_repository" "backend" {
  name = "challenge-cup-backend"
  force_delete = true  # リソース削除時にイメージも強制削除

  image_tag_mutability = "MUTABLE"  # タグの上書きを許可

  encryption_configuration {
    encryption_type = "AES256"  # デフォルトの暗号化を使用
  }
}
