import * as React from "react";
import {StyleSheet, View, WebView} from "react-native";
//const WebViewBridge = require("react-native-webview-bridge");

import {MainWorker, webViewWorkerString} from "webview-crypto";


const injectString = webViewWorkerString + `
(function () {
  var wvw = new WebViewWorker(WebViewBridge.send.bind(WebViewBridge));
  WebViewBridge.onMessage = wvw.onMainMessage.bind(wvw);
}());
`;

export default class PolyfillCrypto extends React.Component<{debug: boolean}, {}> {
  shouldComponentUpdate (nextProps, nextState) {
    return false;
  }

  public static defaultProps: {debug: boolean} = {
    debug: false
  };

  render() {
    let worker: MainWorker;
    console.log(injectString)
    return (
      <View style={styles.hidden} >
        <WebView
          ref={
            (c) => {
              if (c && !worker)  {
                worker = new MainWorker(c.postMessage, this.props.debug);

                if (window.crypto) { // we are in chrome debugger
                  // this means overridng the crypto object itself won't
                  // work, so we have to override all of it's methods
                  window.crypto.getRandomValues = worker.crypto.getRandomValues;
                  for (let name in worker.crypto.subtle) {
                    window.crypto.subtle[name] = worker.crypto.subtle[name];
                  }
                  (window.crypto as any).fake = true;
                } else {
                  (window as any).crypto = worker.crypto;
                }
              }
            }
          }
          onMessage={
            // can't refer to this.state.onBridgeMessage directly
            // because it is not defined when this component is first
            // started, only set in `ref`
            (message: string) => {
              worker.onWebViewMessage(message);
            }
          }
          injectedJavaScript={ injectString }
          onError = {
            (error) => {
              console.warn("react-native-webview-crypto: Error creating webview: ", error);
            }
          }
          javaScriptEnabled
          source={ {uri: "about:blank"} } />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hidden: {
    height: 0,
    opacity: 0
  }
});
