import logging
import re

import boto3
import cv2
import numpy as np
import requests
from django.conf import settings
from django.core.management.base import BaseCommand

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
formatter = logging.Formatter(":%(message)s")

# log both to file and console
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

# log to file
file_handler = logging.FileHandler("verify_player.log")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
logger.info("Initiating player card verification...")

AWS_ACCESS_KEY = "AKIAW3OQWXNNEXO2DAOA"
AWS_SECRET_KEY = "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"


class Command(BaseCommand):
    help = "Verify player cards with API data."

    def detect_prospect_stars(self, image, bucket):
        """Detect Prospect stars using OpenCV
            Takes an image and bucket name and returns the number of stars detected
            under Prospect label
            using OpenCV template matching
        params: image - image file name
                bucket - S3 bucket name
        returns: number of stars detected or 0 if no stars detected
        """
        s3 = boto3.resource(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
        )
        try:
            logger.info("Detecting prospect stars for image ... ")
            bucket = s3.Bucket(bucket)
            object = bucket.Object(image)
            response = object.get()
            img_data = response["Body"].read()

            img = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_GRAYSCALE)

            # get template images from s3 and store in buffer
            templates = ["p1.png", "p2.png", "p3.png", "p4.png", "p5.png"]
            template_buffer = []
            for template in templates:
                object = bucket.Object(f"templates/{template}")
                response = object.get()
                img_data = response["Body"].read()
                template_buffer.append(
                    cv2.imdecode(
                        np.frombuffer(img_data, np.uint8), cv2.IMREAD_GRAYSCALE
                    )
                )

            # loop through templates and match against the img
            matches = []
            for idx, template in enumerate(template_buffer):
                h, w = template.shape[:2]

                # Apply template matching
                res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)

                # Set a threshold to filter out weak matches
                threshold = 0.8
                loc = np.where(res >= threshold)

                # count number of items in each array in loc
                matches.append(
                    {"template": templates[idx], "loc": [len(loc[0]), len(loc[1])]}
                )

                # Draw a rectangle around each matched region
                for pt in zip(*loc[::-1]):
                    cv2.rectangle(img, pt, (pt[0] + w, pt[1] + h), (0, 0, 255), 2)

            # loop through matches and find the one with the most matches
            locs = [match["loc"] for match in matches]
            max_loc = max(locs)
            max_loc_index = locs.index(max_loc)

            # get template number based on index
            template_number = matches[max_loc_index]["template"].split(".")[0][1:]
            return int(template_number)
        except Exception as e:
            logger.error(e)
            return 0

    def detect_top_skills(self, image, bucket):
        """Detect top skills using OpenCV
            Takes an image and bucket name and returns the top skills detected
            using OpenCV template matching
        params: image - image file name
                bucket - S3 bucket name
        returns: list of top skills detected or empty list if no skills detected
        """
        s3 = boto3.resource(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
        )

        try:
            logger.info("Detecting top skills for image ... ")
            bucket = s3.Bucket(bucket)
            object = bucket.Object(image)
            response = object.get()
            img_data = response["Body"].read()

            card = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_GRAYSCALE)

            # get trophy template image from s3 and store in buffer
            object = bucket.Object("templates/trophy.png")
            response = object.get()
            img_data = response["Body"].read()
            trophy = cv2.imdecode(
                np.frombuffer(img_data, np.uint8), cv2.IMREAD_GRAYSCALE
            )

            # Get the dimensions of the template image
            t_h, t_w = trophy.shape[:2]

            # Apply the template matching method
            res = cv2.matchTemplate(card, trophy, cv2.TM_CCOEFF_NORMED)

            # Set a threshold value for the matching scores
            threshold = 0.8

            # Find the locations where the matching score is higher than the threshold
            locations = np.where(res >= threshold)

            # Initialize the AWS Rekognition client
            client = boto3.client(
                service_name="rekognition",
                region_name="us-west-2",
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY,
            )

            # Fetch the text written before each trophy image
            detected_texts = []
            for loc in zip(*locations[::-1]):
                # Extract the region of the image where the trophy image is identified
                roi = card[loc[1] : loc[1] + t_h, loc[0] - 200 : loc[0]]  # noqa E203

                # Convert the image to bytes
                img_bytes = cv2.imencode(".jpg", roi)[1].tobytes()

                # Call the DetectText API to extract the text
                response = client.detect_text(Image={"Bytes": img_bytes})

                if response["TextDetections"]:
                    detected_text = response["TextDetections"][0]["DetectedText"]

                    if detected_text != "-" and detected_text not in detected_texts:
                        detected_texts.append(detected_text)

            return detected_texts

        except Exception as e:
            logger.error(e)
            return []

    def detect_text_back(self, image, bucket):  # noqa: C901
        # noqa: E501
        """Detects text in the input image and returns the text using AWS
        Rekognition API
        params: image - image file name
                bucket - S3 bucket name
        returns: list of text detected in the image
        """
        try:
            client = boto3.client(
                service_name="rekognition",
                region_name="us-west-2",
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY,
            )

            response = client.detect_text(
                Image={"S3Object": {"Bucket": bucket, "Name": image}}
            )

            data = response["TextDetections"]
            values = []
            data_coordinates = []

            for i in range(len(data)):
                if (
                    data[i]["Type"] == "LINE"
                ):  # Only taking full lines in order to keep name as one string.
                    if (
                        data[i]["DetectedText"] != "SWOOPS"
                    ):  # Skipping SWOOPS logos, if any show up.
                        text = data[i]["DetectedText"]

                        x = (
                            data[i]["Geometry"]["BoundingBox"]["Left"]
                            + (data[i]["Geometry"]["BoundingBox"]["Width"]) / 2
                        )

                        y = (
                            data[i]["Geometry"]["BoundingBox"]["Top"]
                            + (data[i]["Geometry"]["BoundingBox"]["Height"]) / 2
                        )

                        data_coordinates.append(
                            (text, x, y)
                        )  # Tuple with text and textbox center coordinates.

            # logger.info(f"data_coordinates: {data_coordinates}")
            curr_x = 0
            curr_y = 0
            min_y = 0.99
            val_idx = 0

            for i in range(len(data_coordinates)):
                curr_y = data_coordinates[i][2]
                if curr_y < min_y:
                    val_idx = i
                    min_y = curr_y

            values.append(data_coordinates[val_idx][0])

            attributes = [
                "3PT",
                "2PT-INT",
                "2PT-MID",
                "FT",
                "DREB",
                "OREB",
                "PASS",
                "IDEF",
                "PDEF",
                "PHY",
                "LONG",
                "HSTL",
                "IQ",
                "LDRS",
                "COACH",
                "POSITION",
                "SEASON",
            ]  # List of all 15 attributes, in order.

            for att in attributes:
                curr_x = 0.0
                curr_y = 0.0
                min_y = 1.1
                val_idx = 0

                for a in range(
                    len(data_coordinates)
                ):  # Finding the coordinates of the attribute header textbox.
                    if str(data_coordinates[a][0]) == str(att):
                        curr_x = data_coordinates[a][1]
                        curr_y = data_coordinates[a][2]

                # if curr_x and curr_y are 0.0 for any of the attributes,
                # set the coordinates to closest value from data_coordinates list
                if (curr_x == 0.0) and (curr_y == 0.0):
                    # logger.info(f'Getting closest coordinates for attribute: {att}')
                    curr_x, curr_y = self.get_closest_coords(str(att))

                for b in range(len(data_coordinates)):
                    if ((curr_x - data_coordinates[b][1]) < 0.04) and (
                        (data_coordinates[b][1] - curr_x) < 0.04
                    ):  # Checking for very similar x-values (same column).
                        if ((data_coordinates[b][2] - curr_y) > 0.0001) and (
                            (data_coordinates[b][2] - curr_y) < min_y
                        ):  # Checking least difference y-value textbox below header
                            val_idx = b
                            min_y = data_coordinates[b][2] - curr_y

                value = data_coordinates[val_idx][0]
                if value in ["??"]:
                    value = None
                elif value == "с":
                    value = "C"
                elif value.isdigit():
                    value = int(value)

                values.append(value)

            # extract player name
            playername = values.pop(0).strip().upper()
            # if playername contains в replace it with B
            playername = playername.replace("в", "B")

            skills = {}
            for i in range(len(attributes)):
                skills[attributes[i]] = values[i]

            # merge skills and values into a dictionary
            skillsdict = dict(zip(attributes, values))

            # add name to dictionary
            skillsdict["name"] = playername
            return skillsdict

        except Exception as e:
            logger.error(f"Error detectng back card text: {str(e)}")
            return None

    def detect_text_front(self, image, bucket):
        """Detects text in the front card and returns the text using AWS Rekognition API
        params: image - image file name
                bucket - S3 bucket name
        returns: list of text detected in the image
        """
        try:
            client = boto3.client(
                service_name="rekognition",
                region_name="us-west-2",
                aws_access_key_id=AWS_ACCESS_KEY,
                aws_secret_access_key=AWS_SECRET_KEY,
            )

            response = client.detect_text(
                Image={"S3Object": {"Bucket": bucket, "Name": image}}
            )

            # loop through data and extract values where Type == LINE
            data = response["TextDetections"]
            imagedata = []

            for i in range(len(data)):
                if data[i]["Type"] == "LINE":
                    # skip first value (player name) and SWOOPS logo text
                    if i == 0 or data[i]["DetectedText"] == "SWOOPS":
                        continue
                    imagedata.append(data[i]["DetectedText"])
            # get first 3 values and the last value
            # convert name to uppercase
            imagedata[-1:] = [imagedata[-1].upper()]
            imagedata = imagedata[:3] + imagedata[-1:]
            return imagedata
        except Exception as e:
            logger.error(f"Error detectng front card text: {str(e)}")
            return None

    def get_mappings(self):
        """Returns a dictionary of mappings for baller API trait_type
        params: None
        returns: dictionary of mappings
        """
        mappings = {
            "SEASON": "Season",
            "PROSPECT": "Prospect",
            "POSITION": "Position 1",
            "3PT": "Three Point Shooting",
            "2PT-INT": "Interior Two Point Shooting",
            "2PT-MID": "Midrange Two Point Shooting",
            "FT": "Free Throw",
            "DREB": "Defensive Rebound",
            "OREB": "Offensive Rebound",
            "PASS": "Assist",
            "PHY": "Physicality",
            "IDEF": "Interior Defense",
            "PDEF": "Perimeter Defense",
            "LONG": "Longevity",
            "HSTL": "Hustle",
            "IQ": "Basketball IQ",
            "LDRS": "Leadership",
            "COACH": "Coachability",
        }
        return mappings

    def get_mappings_top_skills(self):
        """Returns a dictionary of mappings for baller API trait_type
        params: None
        returns: dictionary of mappings
        """
        mappings = {
            "3PT": "Three Point Shooting",
            "2PT-INT": "Interior Two Point Shooting",
            "2PT-MID": "Midrange Two Point Shooting",
            "FT": "Free Throw Shooting",
            "DREB": "Defensive Rebound",
            "OREB": "Offensive Rebound",
            "PASS": "Passing",
            "PHY": "Physicality",
            "IDEF": "Interior Defense",
            "PDEF": "Perimeter Defense",
            "LONG": "Longevity",
            "HSTL": "Hustle",
            "IQ": "Basketball IQ",
            "LDRS": "Leadership",
            "COACH": "Coachability",
        }
        return mappings

    def get_closest_coords(self, attribute):
        """Returns the closest coordinates for the attribute
        params: attribute - attribute to get coordinates for
        returns: set of coordinates
        """
        coords = {
            "3PT": [0.522125244140625, 0.298828125],
            "2PT-INT": [0.70916748046875, 0.29833984375],
            "2PT-MID": [0.896209716796875, 0.29833984375],
            "FT": [0.52239990234375, 0.42578125],
            "DREB": [0.7097178902477026, 0.4258939530700445],
            "OREB": [0.896209716796875, 0.42578125],
            "PASS": [0.522674560546875, 0.55322265625],
            "IDEF": [0.709716796875, 0.5537109375],
            "PDEF": [0.89593505859375, 0.55322265625],
            "PHY": [0.52349853515625, 0.6806640625],
            "LONG": [0.7099826689809561, 0.6807475229725242],
            "HSTL": [0.885772705078125, 0.6806640625],
            "IQ": [0.522674560546875, 0.8134765625],
            "LDRS": [0.699554443359375, 0.80810546875],
            "COACH": [0.886322021484375, 0.80810546875],
            "POSITION": [0.51910400390625, 0.1787109375],
            "SEASON": [0.708892822265625, 0.1787109375],
        }

        # check if attribute is in keys, return coords
        if attribute in coords.keys():
            return coords[attribute]
        else:
            logger.error(f"Attribute {attribute} not found in coordinates")
            return [0, 0]

    def verify_back_skills(self, skillsdict, ballerdata):
        """Verifies skills against baller API
        params: skillsdict - dictionary of skills
                playerid - player id
        returns: Flag indicating if skills match
        """
        logger.info("Verifying back card skills")

        # verify card name against baller API
        if not self.verify_name(skillsdict["name"], ballerdata["name"]):
            logger.info(
                f"""
                Name from image {skillsdict["name"]} does not match name from API
                {ballerdata["name"]}
            """
            )
            return False

        # pop name from skillsdict
        skillsdict.pop("name")

        try:
            # loop through skillsdict, find the corresponding key for ballerdict in
            # mappings and compare values
            valuesmatched = 0
            valuesnotmatched = 0
            mappings = self.get_mappings()
            mappings_top_skills = self.get_mappings_top_skills()
            baller_traits = ballerdata["attributes"]
            baller_topskills = ballerdata["top_skills"]
            # get topskills in array and sort
            baller_topskills = [x for x in baller_topskills.values()]
            baller_topskills.sort()

            flag = True
            for key, value in skillsdict.items():
                if key == "TOP_SKILLS":
                    # get mappings for top skills
                    topskills = [mappings_top_skills[v] for v in value]
                    topskills.sort()
                    if topskills == baller_topskills:
                        valuesmatched += 1
                    else:
                        logger.info("Mismatch found in top skills")
                        logger.info(
                            f"Card Skills: {topskills}, API Skills: {baller_topskills}"
                        )
                        valuesnotmatched += 1
                        flag = False
                if key in mappings.keys():
                    # get value agaisnt this key which will be the trait_type
                    trait_type = mappings[key]
                    # search in ballerdict for this key
                    if trait_type in baller_traits.keys():
                        # get value for this key
                        baller_value = baller_traits[trait_type]

                        # if trait_type is POSITION, check if API has trait_type
                        # Position 2 and add it with Position 1
                        if key == "POSITION":
                            if baller_traits["Position 2"]:
                                baller_value = (
                                    baller_traits["Position 1"]
                                    + "/"
                                    + baller_traits["Position 2"]
                                )

                        # hardcode for IQ = Oi
                        if key == "IQ" and value == "Oi":
                            valuesmatched += 1
                            continue

                        if value == baller_value:
                            valuesmatched += 1
                        else:
                            logger.info(
                                f"Skill: {key}, Card Value: {value}, "
                                f"API Value: {baller_value}"
                            )
                            valuesnotmatched += 1
                            flag = False

            logger.info(
                f"values matched: {valuesmatched},"
                f"values not matched: {valuesnotmatched}"
            )
        except Exception as e:
            logger.error(f"Error in verify_back_skills: {e}")
            flag = False
        return flag

    def convert_cyrillic_to_english(self, character):
        """Converts cyrillic characters to english
        params: charcter - character to convert
        returns: converted character
        """
        mapping = {
            "А": "A",
            "В": "B",
            "С": "C",
            "Е": "E",
            "К": "K",
            "М": "M",
            "О": "O",
            "Р": "P",
            "Т": "T",
        }

        # if character is in mapping, return mapped character else none
        if character in mapping.keys():
            return mapping[character]
        else:
            logger.info(f"Character {character} not found in mapping")
            return character

    def verify_name(self, cardname, apiname):
        """verify name against baller API"""
        # loop through player name, if there are cyrillic characters, convert to english
        flag = True
        if re.search(r"[\u0400-\u04FF]", cardname):
            for i in cardname:
                if re.search(r"[\u0400-\u04FF]", i):
                    logger.info("Player name has cyrillic characters")
                    # convert cyrillic characters to english
                    character = self.convert_cyrillic_to_english(i)
                    cardname = cardname.replace(i, character)

        # hardcode name discrepancies solution
        if apiname == "SWOOPSTER-0" and cardname == "SWOOPSTER-O":
            pass
        # if name has AL and API has AI replace AL with AI, use symmetric difference
        elif "AL " in cardname and "AI " in apiname:
            # cardname = cardname.replace('AL ', 'AI ')
            pass
        elif " IE" in cardname and " WE" in apiname:
            pass
        elif "OVIO" in cardname and "OVIC" in apiname:
            pass
        elif "SKYWW" in cardname and "SKYW" in apiname:
            pass
        elif (cardname == "2PT-INT" or cardname == "JJJ") and apiname == "J J":
            pass
        elif cardname != apiname:
            flag = False
        return flag

    def verify_front_skills(self, skills, ballerdata):
        """Verifies front card skills against baller API.
        This verifies player name and top skills
        params:
          skills - list of skills and player name\n
          ballerdata - player name and traits from baller API response
        returns: Flag indicating if skills match
        """

        # verify card name against baller API
        if not self.verify_name(skills[-1], ballerdata["name"]):
            logger.info(
                f"""Name from image {skills[-1]} does not match name from,
                API {ballerdata["name"]}
                        """
            )
            return False

        # remove player name from skills array, it is last element
        skills.pop()

        # map skills to get trait_type
        mappings = self.get_mappings_top_skills()

        for i in range(len(skills)):
            if skills[i] in mappings.keys():
                skills[i] = mappings[skills[i]]
        # compare skills
        if sorted(skills) == sorted(ballerdata["top_skills"].values()):
            return True
        else:
            logger.info("Mismatch found in front card")
            logger.info(
                f"Card Skills: {skills}, API Skills: "
                f"{ballerdata['top_skills'].values()}"
            )
            return False

    def get_baller_data(self, player_id):
        """Fetches baller data for player_id
        params: player_id - player id
        returns: player data json
        """
        logger.info(f"Fetching baller data point for player id:  {player_id}")
        url = f"https://api.playswoops.com/api/baller/{player_id}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537"
            ".36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36"
        }

        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            logger.info(
                f"Error fetching baller API. Status code: {response.status_code}"
            )
            return False

        data = {"name": response.json()["name"], "attributes": {}, "top_skills": {}}
        for item in response.json()["attributes"]:
            if "trait_type" in item.keys():
                # if item['value] is not null, check if it is float and round it
                if isinstance(item["value"], float):
                    # store in attributes array
                    value = round(item["value"])
                else:
                    value = item["value"]

                # if Top Skill in trait_type, store in top_skills dictionary
                # else store in attributes dictionary
                if "Top Skill" in item["trait_type"]:
                    data["top_skills"][item["trait_type"]] = value
                else:
                    data["attributes"][item["trait_type"]] = value
        return data

    def add_arguments(self, parser):
        parser.add_argument(
            "--player_id",
            "-p",
            help="Player id to verify. If not specified, all players will be verified",
            required=False,
        )

        # add argument to get ranger of player ids
        parser.add_argument(
            "--range",
            "-r",
            help="Range of players to verify. If not specified, all players will be"
            "verified",
            required=False,
        )

        parser.add_argument(
            "--start",
            "-st",
            help="Start range of player ids to verify. If not specified, "
            "all players will be verified",
            required=False,
        )

        parser.add_argument(
            # default value is both
            "--side",
            "-s",
            help="Card side to verify. Valid values: front, back, both",
            default="both",
        )

    def handle(self, *args, **options):
        # if player_id is not specified, get all player ids
        if options["player_id"]:
            player_ids = [options["player_id"]]
        elif options["range"]:
            # if start is not specified, set it to 0
            if not options["start"]:
                options["start"] = 0

            end = int(options["start"]) + int(options["range"])

            # get range of player ids usig start and end
            player_ids = [x for x in range(int(options["start"]), int(end))]
        else:
            # return error
            logger.error("Please specify player_id or range")
            exit(1)

        bucket = settings.AWS_IMAGES_BUCKET_NAME

        # loop through player_ids and verify skills
        for player_id in player_ids:
            logger.info(f"--- Verifying player id: {player_id} ---")

            try:
                # get baller data for this player_id
                ballerdata = self.get_baller_data(player_id)
                if not ballerdata:
                    logger.error(f"Error fetching baller data for player: {player_id}")
                    continue

                # if --side is not specified or side is front, check front card
                if options["side"] in ["front", "both"]:
                    logger.info("Checking front card ...")

                    front_image = f"{str(player_id)}.png"

                    front_skills = self.detect_text_front(front_image, bucket)
                    if not front_skills:
                        # exit(1)
                        continue

                    # verify front card skills
                    if self.verify_front_skills(front_skills, ballerdata):
                        logger.info("Front card skills match between Image and API")
                    else:
                        logger.info(
                            """Error: Front card skills do not match between Image and
                             API"""
                        )
                        continue
                        # exit(1)

                # if --side is not specified or side is back, check back card
                if options["side"] in ["back", "both"]:
                    # verify back card skills
                    logger.info("Checking back card ...")
                    back_image = f"{str(player_id)}_back_card.png"
                    back_skills = self.detect_text_back(back_image, bucket)
                    if not back_skills:
                        # exit(1)
                        continue

                    # detect Prospect *
                    back_skills["PROSPECT"] = self.detect_prospect_stars(
                        back_image, bucket
                    )

                    # detect Top Skills
                    back_skills["TOP_SKILLS"] = self.detect_top_skills(
                        back_image, bucket
                    )

                    if self.verify_back_skills(back_skills, ballerdata):
                        logger.info("Back card skills match between Image and API")
                    else:
                        logger.error(
                            "Error: Back card skills do not match between Image and API"
                        )
                        continue
                        # exit(1)
            except Exception as e:
                logger.error(f"Error verifiying cards with API data points. {str(e)}")
