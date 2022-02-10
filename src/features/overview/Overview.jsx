import { Container, makeStyles, useMediaQuery } from "@material-ui/core"
import { useCallback, useRef } from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useHistory } from "react-router-dom"
import ButtonGroup from "../../components/buttonGroup/ButtonGroup"
import BlocLoaderOsmosis from "../../components/loader/BlocLoaderOsmosis"
import Paper from "../../components/paper/Paper"
import { useCharts } from "../../contexts/ChartsProvider"
import { usePools } from "../../contexts/PoolsProvider"
import { useTokens } from "../../contexts/TokensProvider"
import { useWatchlistTokens } from "../../contexts/WatchlistTokensProvider"
import { useWatchlistPools } from "../../contexts/WatchlistPoolsProvider"
import { formatDate, formateNumberPrice, getDates, getInclude, twoNumber } from "../../helpers/helpers"
import PoolsTable from "../pools/PoolsTable"
import TokensTable from "../tokens/TokensTable"
import ChartVolume from "../../components/chart/ChartVolume"
import ChartLiquidity from "../../components/chart/ChartLiquidity"
import ContainerChartLiquidity from "../../components/chart/ContainerChartLiquidity"
import ContainerChartVolume from "../../components/chart/ContainerChartVolume"

const useStyles = makeStyles((theme) => {
	return {
		overviewRoot: {
			overflowX: "hidden",
		},
		radiant: {
			position: "absolute",
			top: "0",
			left: "0",
			right: "0",
			height: "200vh",
			opacity: "0.3",
			transform: "translateY(-150vh)",
			mixBlendMode: "color",
			pointerEvents: "none",
			background: `radial-gradient(50% 50% at 50% 60%, ${theme.palette.primary.main} 30%,  ${theme.palette.black.light} 100%)`,
		},
		subTitle: {
			color: theme.palette.gray.main,
		},
		container: {
			display: "grid",
			gridAutoRows: "auto",
			rowGap: theme.spacing(2),
		},
		charts: {
			width: "100%",
			display: "flex",
			justifyContent: "space-between",

			[theme.breakpoints.down("xs")]: {
				flexDirection: "column",
				width: "auto",
				"&>:nth-child(1)": {
					marginBottom: theme.spacing(2),
				},
			},
		},
		chart: {
			position: "relative",
			width: "49%",
			zIndex: "0",
			minHeight: "360px",
			[theme.breakpoints.down("xs")]: {
				width: "100%",
				minHeight: "410px",
			},
		},
		containerChart: { height: "250px" },
		chartTitle: {
			padding: `2px 0`,
		},
		chartTextBig: {
			fontSize: theme.fontSize.veryBig,
			color: theme.palette.gray.contrastText,
			padding: `2px 0`,
			fontVariantNumeric: "tabular-nums",
		},
		chartTextSmall: {
			fontSize: "12px",
			padding: `2px 0`,
		},
		containerLoading: {
			position: "relative",
			minWidth: "200px",
			minHeight: "200px",
		},
		chartHeader: {
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			[theme.breakpoints.down("xs")]: {
				flexDirection: "column",
				alignItems: "flex-start",
			},
		},
		chartHeaderData: {},
		chartHeaderButton: {
			alignSelf: "flex-end",
			display: "flex",
			alignItems: "flex-end",
			flexDirection: "column",
			justifyContent: "flex-end",
			padding: theme.spacing(1),
		},
		groupButton: {
			marginBottom: theme.spacing(1),
		},
	}
})

const Overview = () => {
	const classes = useStyles()
	const { dataLiquidityD, dataLiquidityW, dataLiquidityM, dataVolumeD, dataVolumeW, dataVolumeM, loadingData } =
		useCharts()
	const { watchlistTokens } = useWatchlistTokens()
	const { watchlistPools } = useWatchlistPools()
	const [tokensOnWatchlist, setTokensOnWatchlist] = useState([])
	const [poolsOnWatchlist, setPoolsOnWatchlist] = useState([])

	const [size, setSize] = useState("xl")
	const matchXS = useMediaQuery((theme) => theme.breakpoints.down("xs"))
	const matchSM = useMediaQuery((theme) => theme.breakpoints.down("sm"))
	const matchMD = useMediaQuery((theme) => theme.breakpoints.down("md"))
	const matchLD = useMediaQuery((theme) => theme.breakpoints.down("ld"))

	const { pools, loadingPools } = usePools()
	const { tokens, loadingTokens } = useTokens()
	const [dataPools, setDataPools] = useState([])
	const [dataTokens, setDataTokens] = useState([])
	const history = useHistory()


	useEffect(() => {
		// sort pools on the first time is fetched
		let data = [...pools]
		data.sort((a, b) => {
			if (b.liquidity < a.liquidity) {
				return -1
			}
			if (b.liquidity > a.liquidity) {
				return 1
			}
			return 0
		})
		setDataPools(data)
	}, [pools])

	useEffect(() => {
		// sort tokens on the first time is fetched
		let data = [...tokens]
		data.sort((a, b) => {
			if (b.liquidity < a.liquidity) {
				return -1
			}
			if (b.liquidity > a.liquidity) {
				return 1
			}
			return 0
		})
		setDataTokens(data)
	}, [tokens])

	useEffect(() => {
		if (matchXS) {
			setSize("xs")
		} else if (matchSM) {
			setSize("sm")
		} else if (matchMD) {
			setSize("md")
		} else if (matchLD) {
			setSize("ld")
		} else {
			setSize("xl")
		}
	}, [matchXS, matchSM, matchMD, matchLD])

	const onClickPool = (pool) => {
		history.push(`/pool/${pool.id}`)
	}

	const onClickToken = (token) => {
		history.push(`/token/${token.symbol}`)
	}

	useEffect(() => {
		let tokensWL = tokens.filter((token) => {
			let index = getInclude(watchlistTokens, (symbol) => {
				return symbol === token.symbol
			})
			return index >= 0
		})
		setTokensOnWatchlist(tokensWL)
	}, [watchlistTokens, tokens])

	useEffect(() => {
		let poolsWL = pools.filter((pool) => {
			let index = getInclude(watchlistPools, (plId) => {
				return plId === pool.id
			})
			return index >= 0
		})
		setPoolsOnWatchlist(poolsWL)
	}, [watchlistPools, pools])

	return (
		<div className={classes.overviewRoot}>
			<div className={classes.container}>
				<p className={classes.subTitle}>Osmosis - Overview</p>
				<div className={classes.charts}>
					<Paper className={classes.chart}>
						<BlocLoaderOsmosis open={loadingData} borderRadius={true} />
						<div className={classes.containerChart}>
							<ContainerChartLiquidity
								dataDay={dataLiquidityD}
								dataWeek={dataLiquidityW}
								dataMonth={dataLiquidityM}
								title="Liquidity"
							/>
						</div>
					</Paper>
					<Paper className={classes.chart}>
						<BlocLoaderOsmosis open={loadingData} borderRadius={true} />
						<div className={classes.containerChart}>
							<ContainerChartVolume
								dataDay={dataVolumeD}
								dataWeek={dataVolumeW}
								dataMonth={dataVolumeM}
								title="Volume"
							/>
						</div>
					</Paper>
				</div>
				<p className={classes.subTitle}>Your token watchlist</p>
				<Paper>
					{watchlistTokens.length > 0 ? (
						<TokensTable
							data={tokensOnWatchlist}
							textEmpty={"Any rows"}
							size={size}
							onClickToken={onClickToken}
							sortable={true}
						/>
					) : (
						<p>Saved tokens will appear here</p>
					)}
				</Paper>
				<p className={classes.subTitle}>Your pool watchlist</p>
				<Paper>
					{watchlistPools.length > 0 ? (
						<PoolsTable
							data={poolsOnWatchlist}
							textEmpty={"Any rows"}
							size={size}
							onClickPool={onClickPool}
							sortable={true}
						/>
					) : (
						<p>Saved pools will appear here</p>
					)}
				</Paper>
				<p className={classes.subTitle}>Top tokens</p>
				<Paper className={classes.containerLoading}>
					<BlocLoaderOsmosis open={loadingTokens} borderRadius={true} />
					<TokensTable
						data={dataTokens}
						textEmpty={"Any rows"}
						size={size}
						sortable={true}
						onClickToken={onClickToken}
					/>
				</Paper>
				<p className={classes.subTitle}>Top pools</p>
				<Paper className={classes.containerLoading}>
					<BlocLoaderOsmosis open={loadingPools} borderRadius={true} />
					<PoolsTable data={dataPools} textEmpty={"Any rows"} size={size} sortable={true} onClickPool={onClickPool} />
				</Paper>
			</div>
		</div>
	)
}

export default Overview
