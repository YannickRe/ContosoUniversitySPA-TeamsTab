import React from 'react';
import { Button } from 'reactstrap';
import * as microsoftTeams from "@microsoft/teams-js";
import { AppContext } from '../AppContext';

export interface IBarcodeProps {

}

export interface IBarcodeState {
    decodedText?: string;
    error?: any;
    consent?: string;
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

            try {
                navigator.permissions.query({ name: 'camera' }).then((result) => {
                    if (result.state === 'granted') {
                        this.setState({
                            consent: "You have already authorized access to your camera."
                        });
                    } else if (result.state === 'prompt') {
                        this.setState({
                            consent: "You will be prompted for access to your camera, to read the barcode."
                        });
                    }
                });
            }
            catch (error) {}
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
        let consent = null;

        if (this.state.consent) {
            consent = <p>{this.state.consent}</p>;
        }

        if (this.state.error) {
            contents = <React.Fragment>
                            <h3>Error</h3>
                            <p>{this.state.error}</p>
                        </React.Fragment>;
        }
        else if (this.state.decodedText) {
            contents = <React.Fragment>
                <h3>Barcode Text</h3>
                <p>{this.state.decodedText}</p>
            </React.Fragment>;
        }
        return (
            <React.Fragment>
                <h1>Barcode</h1>
                <Button color="primary" onClick={() => this.scanCode()}>Scan code</Button>
                {consent}
                <hr />
                {contents}
            </React.Fragment>
        );
    }
}

Barcode.contextType = AppContext;