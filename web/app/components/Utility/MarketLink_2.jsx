import React from "react";
import {Link} from "react-router/es";
import ChainTypes from "./ChainTypes";
import BindToChainState from "./BindToChainState";
import AssetName from "./AssetName";

/**
 *  Given a base and quote asset, render a link to that market
 *
 *  Expected Properties:
 *     base:  asset id, which will be fetched from the ChainStore
 *     quote: either an asset id or a balance id
 *
 */

class MarketLink_2 extends React.Component {

    static propTypes = {
        quote: ChainTypes.ChainObject.isRequired,
        base: ChainTypes.ChainObject.isRequired
    };

    static defaultProps = {
        base: "1.3.0"
    };

    render() {
        let {base, quote} = this.props;
        if (base.get("id") === quote.get("id")) {
            // return null;
            return <span><AssetName name={quote.get("symbol")} /></span>;
        }
        let marketID = quote.get("symbol") + "_" + base.get("symbol");
        let marketName = <span><AssetName name={quote.get("symbol")} /></span>;
        return (
            <Link to={`/market/${marketID}`}>{marketName}</Link>
        );
    }
}

MarketLink_2 = BindToChainState(MarketLink_2);

class ObjectWrapper extends React.Component {

    static propTypes = {
        object: ChainTypes.ChainObject.isRequired
    };

    render () {
        let {object} = this.props;
        let quoteAsset = object.has("asset_type") ? object.get("asset_type") : object.get("id");

        return <MarketLink_2 quote={quoteAsset} />;
    }
}
ObjectWrapper = BindToChainState(ObjectWrapper);

MarketLink_2.ObjectWrapper = ObjectWrapper;

export default MarketLink_2;
