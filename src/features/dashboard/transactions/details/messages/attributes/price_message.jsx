import { makeStyles } from "@material-ui/core"
import { capitalizeFirstLetter, formateNumberDecimalsAuto } from "../../../../../../helpers/helpers"

const useStyles = makeStyles((theme) => {
	return {
		rootPriceMessage: {
			display: "flex",
			flexDirection: "row",
			width: "100%",
			alignContent: "center",
			justifyContent: "space-between",
			margin: "6px 0",
			[theme.breakpoints.down("xs")]: {},
		},
		name: {
			fontSize: "12px",
			color: theme.palette.primary.contrastText,
		},
		firstNumber: {
			fontSize: "13px",
		},
		restNumber: {
			fontSize: "11px",
		},
		symbol: {
			paddingLeft: "5px",
			color: theme.palette.table.cellDark,
			fontSize: "12px",
			maxWidth: "50px",
			overflow: "hidden",
			textOverflow: "ellipsis",
			display: "inline-block",
		},
		price:{
			display: "flex",
			flexDirection: "row",
			alignItems: "center",
			
		}
	}
})
const PriceMessage = ({ denom, amount, name }) => {
	const classes = useStyles()
	console.log("price_message.jsx -> 31: denom, amount, name", denom, amount, name)

	let nameDisplay = capitalizeFirstLetter(name.replace("_", " "))
	let splitNumber = formateNumberDecimalsAuto({ price: amount }).toString().split(".")

	return (
		<div className={`${classes.rootPriceMessage}`}>
			<p className={classes.name}>{nameDisplay}</p>
			<p className={classes.price}>
				<span className={classes.firstNumber}>{splitNumber[0]}</span>
				{splitNumber.length > 1 ? <span className={classes.restNumber}>.{splitNumber[1]}</span> : null}
				<span className={classes.symbol}>{denom}</span>
			</p>
		</div>
	)
}

export default PriceMessage
