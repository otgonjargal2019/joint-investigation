#!/usr/bin/env bash
set -e

INIT_FLAG="/data/.initialized"

# 1) MinIO 서버 백그라운드 실행
/usr/bin/minio server /data --console-address ":9001" &

# 2) MinIO가 뜰 때까지 health check
echo "=== Waiting for MinIO to be ready ==="
until curl -s http://localhost:9000/minio/health/ready > /dev/null; do
  echo "MinIO is not yet ready, waiting..."
  sleep 3
done

# 3) init.sh 실행
if [ ! -f "$INIT_FLAG" ]; then
  # echo "Running init.sh for the first time..."
  echo "=== Running init.sh ==="
  /usr/local/bin/init.sh

  echo "=== init.sh complete ==="
  touch "$INIT_FLAG"
else
  echo "init.sh already executed, skipping..."
fi

wait
