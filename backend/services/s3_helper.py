import logging

import boto3
from django.conf import settings
from django.utils.module_loading import import_string

LOGGER = logging.getLogger(__name__)


def get(bucket_name, aws_access_key_id, aws_secret_access_key):
    """Gets the s3 helper"""
    return import_string(settings.S3_HELPER)(
        bucket_name, aws_access_key_id, aws_secret_access_key
    )


class S3Helper:
    def __init__(self, bucket_name, aws_access_key_id, aws_secret_access_key):
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )

        self.bucket_name = bucket_name

    def get_url(self, key):
        return self.s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": key},
            ExpiresIn=100,
        )

    def upload_image(self, image_data, key):
        response = self.s3.put_object(Body=image_data, Bucket=self.bucket_name, Key=key)

        self.s3.put_object_acl(ACL="public-read", Bucket=self.bucket_name, Key=key)
        return response

    def copy_image(self, current_key, new_key):
        copy_source = {"Bucket": self.bucket_name, "Key": current_key}
        self.s3.copy(copy_source, self.bucket_name, new_key)
        return self.s3.put_object_acl(
            ACL="public-read", Bucket=self.bucket_name, Key=new_key
        )


class S3MockHelper:
    def __init__(self, bucket_name, aws_access_key_id, aws_secret_access_key):
        pass

    def get_url(self, key):
        return "https://s3.us-west-2.amazonaws.com/images.playswoops.com/0.png"

    def upload_image(self, image_data, key):
        return {
            "ResponseMetadata": {
                "RequestId": "lkut1LbXJDDWDErlMxjqIS8rCUKKT1OWwWoxILQV6CbTj0RMkPSw",
                "HTTPStatusCode": 200,
                "HTTPHeaders": {
                    "etag": '"22b75d6007e06f4a959d1b1d69b4c4bd"',
                    "last-modified": "Mon, 31 Oct 2022 18:42:34 GMT",
                    "content-length": "7",
                    "x-amzn-requestid": "lkut1LbXJDDWDErlMxjqIS8rCUKKT1OWwWoxILQV6CbTj0RMkPSw",  # noqa: E501
                },
                "RetryAttempts": 0,
            },
            "ETag": '"22b75d6007e06f4a959d1b1d69b4c4bd"',
        }

    def copy_image(self, current_key, new_key):
        return {
            "ResponseMetadata": {
                "RequestId": "QOFvPZ9z2TRs0PdDfFy3iO2Swriu4dB82pGWdmWUJPlyV3Fnr86e",
                "HTTPStatusCode": 200,
                "HTTPHeaders": {
                    "x-amzn-requestid": "QOFvPZ9z2TRs0PdDfFy3iO2Swriu4dB82pGWdmWUJPlyV3Fnr86e"  # noqa: E501
                },
                "RetryAttempts": 0,
            }
        }
