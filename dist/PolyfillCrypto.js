"use strict";
const React = require("react");
const react_native_1 = require("react-native");
const WebViewBridge = require("react-native-webview-bridge");
const webview_crypto_1 = require("webview-crypto");
const injectString = webview_crypto_1.webViewWorkerString + `
(function () {
  var wvw = new WebViewWorker(WebViewBridge.send.bind(WebViewBridge));
  WebViewBridge.onMessage = wvw.onMainMessage.bind(wvw);
}());
`;
class PolyfillCrypto extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }
    render() {
        let worker;
        console.log(injectString);
        return (React.createElement(react_native_1.View, {style: styles.hidden}, React.createElement(WebViewBridge, {ref: (c) => {
            if (c && !worker) {
                worker = new webview_crypto_1.MainWorker(c.sendToBridge, this.props.debug);
                if (window.crypto) {
                    window.crypto.getRandomValues = worker.crypto.getRandomValues;
                    for (let name in worker.crypto.subtle) {
                        window.crypto.subtle[name] = worker.crypto.subtle[name];
                    }
                    window.crypto.fake = true;
                }
                else {
                    window.crypto = worker.crypto;
                }
            }
        }, onBridgeMessage: (message) => {
            console.log('message', message);
            worker.onWebViewMessage(message);
        }, injectedJavaScript: injectString, onError: (error) => {
            console.warn("react-native-webview-crypto: Error creating webview: ", error);
        }, javaScriptEnabled: true, source: { uri: "about:blank" }})));
    }
}
PolyfillCrypto.defaultProps = {
    debug: false
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PolyfillCrypto;
const styles = react_native_1.StyleSheet.create({
    hidden: {
        height: 0,
        opacity: 0
    }
});
//# sourceMappingURL=PolyfillCrypto.js.map