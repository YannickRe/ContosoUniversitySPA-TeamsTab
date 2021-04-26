import React from 'react';
import { Button } from 'reactstrap';
import * as microsoftTeams from "@microsoft/teams-js";

export interface IBarcodeProps {

}

export interface IBarcodeState {
    decodedText?: string;
    error?: any;
}

export class Barcode extends React.Component<IBarcodeProps, IBarcodeState> {
    static displayName = Barcode.name;

    constructor(props: IBarcodeProps) {
        super(props);

        this.state = {};
    }

    public componentDidMount(): void {
        if (this.context.inTeams) {
            microsoftTeams.initialize();
        }
    }

    private async scanCode() {
        const config: microsoftTeams.media.BarCodeConfig = {
            timeOutIntervalInSec: 30,
        };

        try {
            var text = await new Promise<string>((resolve, reject) => {
                microsoftTeams.media.scanBarCode((error: microsoftTeams.SdkError, decodedText: string) => {
                    if (error) {
                        if (error.message) {
                            reject("ErrorCode: " + error.errorCode + error.message);
                        } else {
                            reject("ErrorCode: " + error.errorCode);
                        }
                    } else if (decodedText) {
                        resolve(decodedText);
                    }
                }, config);
            });

            this.setState({
                decodedText: text,
                error: undefined
            });
        }
        catch (err) {
            this.setState({
                decodedText: undefined,
                error: err
            });
        }
    }

    public render(): React.ReactElement<IBarcodeProps> {
        let contents = null;
        if (this.state.error) {
            contents = <p>{this.state.error}</p>;
        }
        else if (this.state.decodedText) {
            contents = <p>{this.state.decodedText}</p>;
        }
        return (
            <React.Fragment>
                <h1>Barcode</h1>
                <Button color="primary" onClick={() => this.scanCode()}>Scan code</Button>
                {contents}
            </React.Fragment>
        );
    }
}
