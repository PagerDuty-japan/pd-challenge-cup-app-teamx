# Kubernetesマニフェストの使用方法

このディレクトリには、Kustomizeを使用して変数化されたフロントエンドとバックエンドのKubernetesマニフェストが含まれています。

## ディレクトリ構造

```
app/manifests/
├── frontend/                  # フロントエンドマニフェスト
│   ├── base/                  # ベースとなるマニフェスト
│   │   ├── deployment.yaml    # チーム名が変数化されたデプロイメント
│   │   ├── service.yaml       # チーム名が変数化されたサービス
│   │   ├── secrets.yaml       # チーム名が変数化されたシークレット
│   │   └── kustomization.yaml # ベースのリソースと変数を定義
│   ├── overlays/              # 環境ごとのオーバーレイ
│   │   ├── teamx/             # teamx環境
│   │   │   └── kustomization.yaml # teamxの設定
│   │   └── teamy/             # teamy環境
│   │       └── kustomization.yaml # teamyの設定
│   └── kustomization.yaml     # ルートのkustomization
├── backend/                   # バックエンドマニフェスト
│   ├── base/                  # ベースとなるマニフェスト
│   │   ├── deployment.yaml    # チーム名が変数化されたデプロイメント
│   │   ├── service.yaml       # チーム名が変数化されたサービス
│   │   ├── secrets.yaml       # チーム名が変数化されたシークレット
│   │   └── kustomization.yaml # ベースのリソースと変数を定義
│   ├── overlays/              # 環境ごとのオーバーレイ
│   │   ├── teamx/             # teamx環境
│   │   │   └── kustomization.yaml # teamxの設定
│   │   └── teamy/             # teamy環境
│   │       └── kustomization.yaml # teamyの設定
│   └── kustomization.yaml     # ルートのkustomization
└── ingress/                   # Ingressマニフェスト
    └── ingress.yaml           # Ingressリソース
```

## 使用方法

### 既存のチーム環境を適用する

特定のチーム環境のマニフェストを適用するには、以下のコマンドを実行します：

#### フロントエンド

```bash
# teamx環境を適用
kubectl apply -k app/manifests/frontend/overlays/teamx/

# teamy環境を適用
kubectl apply -k app/manifests/frontend/overlays/teamy/
```

#### バックエンド

```bash
# teamx環境を適用
kubectl apply -k app/manifests/backend/overlays/teamx/

# teamy環境を適用
kubectl apply -k app/manifests/backend/overlays/teamy/
```

### 新しいチーム環境を追加する

新しいチーム環境（例：teamz）を追加するには、以下の手順を実行します：

#### フロントエンド

1. 新しいオーバーレイディレクトリを作成します：

```bash
mkdir -p app/manifests/frontend/overlays/teamz
```

2. 新しいチーム用の`kustomization.yaml`を作成します：

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# ベースディレクトリの参照
resources:
  - ../../base

# チーム名の設定
namePrefix: ""
nameSuffix: ""
namespace: teamz

# 変数の設定
vars:
  - name: TEAM_NAME
    objref:
      kind: Deployment
      name: frontend
      apiVersion: apps/v1
    fieldref:
      fieldpath: metadata.namespace
```

3. 必要に応じて、ルートの`kustomization.yaml`を更新します：

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# 利用可能なオーバーレイの一覧
resources:
  - overlays/teamx
  - overlays/teamy
  - overlays/teamz  # 新しいチームを追加
```

4. 新しいチーム環境を適用します：

```bash
kubectl apply -k app/manifests/frontend/overlays/teamz/
```

#### バックエンド

1. 新しいオーバーレイディレクトリを作成します：

```bash
mkdir -p app/manifests/backend/overlays/teamz
```

2. 新しいチーム用の`kustomization.yaml`を作成します：

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# ベースディレクトリの参照
resources:
  - ../../base

# チーム名の設定
namePrefix: ""
nameSuffix: ""
namespace: teamz

# 変数の設定
vars:
  - name: TEAM_NAME
    objref:
      kind: Deployment
      name: backend
      apiVersion: apps/v1
    fieldref:
      fieldpath: metadata.namespace
```

3. 必要に応じて、ルートの`kustomization.yaml`を更新します：

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# 利用可能なオーバーレイの一覧
resources:
  - overlays/teamx
  - overlays/teamy
  - overlays/teamz  # 新しいチームを追加
```

4. 新しいチーム環境を適用します：

```bash
kubectl apply -k app/manifests/backend/overlays/teamz/
```

## 変数化されている箇所

### フロントエンド

以下の箇所がチーム名で変数化されています：

1. 全てのリソースの`metadata.namespace`
2. デプロイメントのコンテナイメージ名：`205930621170.dkr.ecr.ap-northeast-1.amazonaws.com/challenge-cup-frontend-$(TEAM_NAME):latest`

### バックエンド

以下の箇所がチーム名で変数化されています：

1. 全てのリソースの`metadata.namespace`
2. デプロイメントのコンテナイメージ名：`205930621170.dkr.ecr.ap-northeast-1.amazonaws.com/challenge-cup-backend-$(TEAM_NAME):latest`

これにより、新しいチーム環境を簡単に追加できます。
