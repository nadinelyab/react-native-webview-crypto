import * as React from "react";
export default class PolyfillCrypto extends React.Component<{
    debug: boolean;
}, {}> {
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    static defaultProps: {
        debug: boolean;
    };
    render(): JSX.Element;
}
