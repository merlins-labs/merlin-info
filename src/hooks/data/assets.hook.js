import { useQuery } from "react-query"
import { formatAssets } from "../../formaters/assets.formatter"
import useRequest from "../request.hook"

export const useAssets = () => {
	const request = useRequest()

	const getter = async ({ queryKey }) => {
		const [_, { }] = queryKey
		const response = await request({
			url: `https://raw.githubusercontent.com/osmosis-labs/assetlists/main/osmosis-1/osmosis-1.assetlist.json`,
			method: "GET",
		})
		return formatAssets(response.data)
	}

	const { data, isLoading, isFetching } = useQuery(["assets", {}], getter)
	const assets = data ? data : {}
	return { data: assets, isLoading, isFetching }
}

export const getExponent = (asset, denom) => {
	if (denom === asset.symbol) return 0
	else {
		let expo = asset.denomUnits.find((d) => d.denom === asset.display).exponent
		if (!expo) return 0
		return expo
	}
}

export const getAsset = (assets, token) => {
	let asset = null
	if (token.denom) {
		asset = assets[token.denom]
	} else if (token.symbol) {
		asset = assets[token.symbol.toUpperCase()]
	}
	return asset
}

export const getImageFromAsset = (assets, token) => {
	let asset = getAsset(assets, token)
	return asset?.image
}
