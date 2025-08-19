#!/bin/bash

BUCKET="worlds-data"
ZIP=proxy.zip
FUNCTION="squarespace-api-proxy"
GOOS=linux CGO_ENABLED=0 GOARCH=arm64 go build -o bootstrap main.go
zip $ZIP bootstrap

# Check if s3 bucket exists before uploading
if ! aws s3api head-bucket --bucket $BUCKET > /dev/null;then
    echo "Bucket $BUCKET does not exist or you don't have permission to access it"
    exit 1
fi

aws s3 cp $ZIP s3://$BUCKET

aws lambda update-function-code \
    --function-name "$FUNCTION" \
    --s3-bucket "$BUCKET" \
    --s3-key "$ZIP" > /dev/null
echo "Updated lambda $FUNCTION"

# Cleanup
rm bootstrap $ZIP

exit 0