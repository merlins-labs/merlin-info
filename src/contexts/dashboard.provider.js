import { createContext, useContext, useEffect, useState } from "react"
import API from "../helpers/API"
import { useKeplr } from "./KeplrProvider"
import relativeTime from "dayjs/plugin/relativeTime"
import utc from "dayjs/plugin/utc"
import dayjs from "dayjs"
import { getTypeDashboard } from "../helpers/helpers"
const DashboardContext = createContext()
dayjs.extend(relativeTime)
dayjs.extend(utc)

export const useDashboard = () => useContext(DashboardContext)

export const DashboardProvider = ({ children }) => {
	const { address, CHAIN_ID } = useKeplr()

	const getTypeTrx = async ({ address }) => {
		let response = await API.request({
			url: `https://api-osmosis-chain.imperator.co/txs/v1/tx/count/${address}`,
			useCompleteURL: true,
			type: "get",
		})
		let res = response.data.map((type) => {
			return {
				type: getTypeDashboard(type.type),
				count: type.count,
			}
		})
		res.sort((a, b) => {
			return b.count - a.count
		})
		return res
	}

	const getTrx = async ({ address, limit = 10, offset = 0, type }) => {
		let url = `https://api-osmosis-chain.imperator.co/txs/v1/tx/address/${address}?limit=${limit}&offset=${offset}`
		if (type) url += `&type=${type}`
		let response = await API.request({
			url,
			useCompleteURL: true,
			type: "get",
		})

		let res = []
		response.data.forEach((item) => {
			let trx = {
				status: "",
				time: { display: "", value: null },
				hash: { display: "", value: null },
				types: [],
				fees: 0,
				height: 0,
				messages: [],
				chainId: "",
			}

			trx.status = item.tx_response.code === 0 ? "success" : "failed"

			let time = new Date(item.time_tx)
			const tzOffset = new Date(item.time_tx).getTimezoneOffset()
			let sourceDate = dayjs(item.time_tx).add(-tzOffset, "minute")
			let timeAgo = dayjs(sourceDate).utc().fromNow(false)
			trx.time.display = timeAgo
			trx.time.value = time

			let hash = item.tx_response.txhash
			let hashDisplay = hash.substring(0, 5) + "..." + hash.substring(hash.length - 5)
			trx.hash.display = hashDisplay
			trx.hash.value = hash

			let fees = item.tx_response.tx.auth_info.fee
			trx.fees = fees.amount.reduce((pr, cr) => pr + cr.amount, 0) / 1_000_000

			trx.height = item.height
			let types = []
			trx.messages = item.tx_response.tx.body.messages.map((message) => {
				let msg = { ...message }
				let type = msg["@type"]
				type = type.replace("/", "")
				msg.type = getTypeDashboard(type)
				if (!msg.type) msg.type = type
				msg.type
				types.push(msg.type)
				return msg
			})
			trx.types = types

			trx.chainId = CHAIN_ID

			res.push(trx)
		})

		return res
	}

	const getAdresses = async () => {
		let url = "https://api-osmosis-chain.imperator.co/swap/v1/pool/1?only_success=false&limit=50&offset=0"
		let response = await API.request({
			url,
			useCompleteURL: true,
			type: "get",
		})

		let addresses = []
		response.data.forEach((item) => {
			let address = item.address
			if (!addresses.includes(address)) addresses.push(address)
		})
		return addresses
	}

	return (
		<DashboardContext.Provider value={{ address, getTypeTrx, getTrx, getAdresses }}>
			{children}
		</DashboardContext.Provider>
	)
}
