FROM quay.io/minio/minio:latest

# .env 파일 복사
COPY .env /usr/local/bin/.env

# init.sh 스크립트 복사
COPY init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

# entrypoint 스크립트 복사
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
