sudo sudo yum -y install nmap-ncat bind-utils emacs
aws eks --region ap-northeast-1 update-kubeconfig --name challenge-cup-cluster
kubectl config set-context --current --namespace=teamx
cd /tmp
wget https://github.com/stern/stern/releases/download/v1.32.0/stern_1.32.0_linux_amd64.tar.gz
tar xvf stern_1.32.0_linux_amd64.tar.gz
sudo install stern /usr/local/bin/