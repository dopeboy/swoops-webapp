import utils.helpers


class OpenSeaAPI:
    def __init__(
        self,
        base_url="https://testnets-api.opensea.io",
        chain="ethereum",
        apikey=None,
        version="v2",
    ):
        self.chain = chain
        self.api_url = f"{base_url}/{version}"
        self.apikey = apikey

    def _make_request(
        self, endpoint, params=None, headers={"accept": "application/json"}
    ):
        if self.apikey:
            headers["X-API-KEY"] = self.apikey

        url = f"{self.api_url}/{endpoint}"
        response = utils.helpers.retry_request(url, headers=headers, params=params)
        if not response:
            return None
        return response.json()

    def retrieve_listings_by_created_date(self, asset_contract_address, token_ids):
        query_params = {
            "asset_contract_address": asset_contract_address,
            "limit": 50,
            "order_by": "created_date",
            "token_ids": token_ids,
        }

        endpoint = f"orders/{self.chain}/seaport/listings"
        return self._make_request(endpoint, query_params)
