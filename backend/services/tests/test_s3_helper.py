from django.conf import settings

import services.s3_helper


def test_upload_image(s3_client):

    settings.S3_HELPER = "services.s3_helper.S3Helper"
    s3_helper = services.s3_helper.get(
        settings.AWS_IMAGES_BUCKET_NAME,
        settings.AWS_IMAGES_BUCKET_ACCESS_KEY,
        settings.AWS_IMAGES_BUCKET_SECRET,
    )

    key = "swoops_image.png"
    image_data = bytes("Hello-Swoops", "utf-8")
    s3_helper.upload_image(image_data=image_data, key=key)

    # check if files exist in bucket
    assert "ResponseMetadata" in s3_client.get_object(
        Bucket=settings.AWS_IMAGES_BUCKET_NAME, Key=key
    )


def test_get_url(s3_client):
    settings.S3_HELPER = "services.s3_helper.S3Helper"

    s3_helper = services.s3_helper.get(
        settings.AWS_IMAGES_BUCKET_NAME,
        settings.AWS_IMAGES_BUCKET_ACCESS_KEY,
        settings.AWS_IMAGES_BUCKET_SECRET,
    )

    # upload image
    key = "swoops_image.png"
    image_data = bytes("Hello-Swoops", "utf-8")
    s3_helper.upload_image(image_data=image_data, key=key)

    # check url can be retrieved
    assert "/swoops_image.png" in s3_helper.get_url(key)


def test_copy_image(s3_client):
    settings.S3_HELPER = "services.s3_helper.S3Helper"
    s3_helper = services.s3_helper.get(
        settings.AWS_IMAGES_BUCKET_NAME,
        settings.AWS_IMAGES_BUCKET_ACCESS_KEY,
        settings.AWS_IMAGES_BUCKET_SECRET,
    )

    # upload image
    current_key = "swoops_image.png"
    image_data = bytes("Hello-Swoops", "utf-8")
    s3_helper.upload_image(image_data=image_data, key=current_key)

    new_key = "copy_swoops_image.png"
    s3_helper.copy_image(current_key, new_key)

    # check if files exist in bucket
    assert "ResponseMetadata" in s3_client.get_object(
        Bucket=settings.AWS_IMAGES_BUCKET_NAME, Key=new_key
    )
