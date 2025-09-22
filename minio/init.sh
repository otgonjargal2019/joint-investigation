#!/usr/bin/env bash
set -e

# .env 파일에서 변수 불러오기
source .env

# 1) MinIO Root 계정으로 Alias 세팅
echo "=== Configuring mc alias ==="
mc alias set joint_investigation http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

# 2) 버킷 생성 (검색 이미지, 프로필 이미지)
echo "=== Creating buckets ==="
mc mb --ignore-existing joint_investigation/profile-images
mc mb --ignore-existing joint_investigation/notice
mc mb --ignore-existing joint_investigation/research
mc mb --ignore-existing joint_investigation/investigation
echo "=== Created buckets ==="

# 3) Public Read
mc anonymous set download joint_investigation/notice
mc anonymous set download joint_investigation/research
mc anonymous set download joint_investigation/investigation

# 4) profile-images 버킷 Public Read 설정
echo "=== Setting public read policy on profile-images ==="
mc anonymous set download joint_investigation/profile-images

# 5) NFT-EYES 웹용 계정 생성
echo "=== Creating new user: $NFT_EYES_WEB_USER ==="
mc admin user add joint_investigation "$NFT_EYES_WEB_USER" "$NFT_EYES_WEB_PASS"

# 6) 프로필 이미지만 전용 정책(읽기/쓰기/삭제) 부여
echo "=== Creating custom policy for profile-images ==="
cat <<EOF > profile-images-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::profile-images"
      ]
    },
    {
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::profile-images/*"
      ]
    }
  ]
}
EOF

echo "=== Applying policy to MinIO ==="
mc admin policy create joint_investigation profile-images-policy profile-images-policy.json
mc admin policy attach joint_investigation profile-images-policy --user "$NFT_EYES_WEB_USER"

echo "=== All done! ==="
