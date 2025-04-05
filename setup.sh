sudo sudo yum -y install nmap-ncat bind-utils emacs
aws eks --region ap-northeast-1 update-kubeconfig --name challenge-cup-cluster
kubectl config set-context --current --namespace=teamx