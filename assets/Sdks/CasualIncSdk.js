function AddXP(e) {
	"undefined" != typeof Unity && Unity.call("AddXP_" + e);
}

function AddCoin(e) {
	"undefined" != typeof Unity && Unity.call("AddCR_" + e);
}

function OnBackButton() {
	"undefined" != typeof Unity && Unity.call("Quit");
}