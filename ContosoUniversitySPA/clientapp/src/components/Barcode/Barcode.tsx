import React from 'react';
import { Button } from 'reactstrap';
import * as microsoftTeams from "@microsoft/teams-js";
import { AppContext } from '../AppContext';
import { Redirect } from 'react-router-dom';
import authService from "../../services/auth.service.instance";

export interface IBarcodeProps {

}

export interface IBarcodeState {
    studentDetailUrl?: string;
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

            //check if exists
            const response = await authService.getInstance().fetch(`api/students/${text}`);
            if (response.ok) {
                this.setState({
                    studentDetailUrl: `/students/details/${text}`,
                    error: undefined
                });
            }
            else {
                throw new Error(`The student with ID "${text}" could not be found.`)
            }
        }
        catch (err) {
            this.setState({
                studentDetailUrl: undefined,
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
                            <div className="alert alert-danger" role="alert">
                                <h4 className="alert-heading">An error occurred</h4>
                                <p>We regret to inform you that an error has occurred while working with the Contoso University applications, more details below.</p>
                                <hr />
                                <p className="mb-0"><pre>{this.state.error}</pre></p>
                            </div>
                        </React.Fragment>;
        }
        else if (this.state.studentDetailUrl) {
            contents =  <React.Fragment>
                            <Redirect to={this.state.studentDetailUrl} />
                        </React.Fragment>;
        }
        return (
            <React.Fragment>
                <h1>Find Student by QR code</h1>
                <Button color="primary" onClick={() => this.scanCode()}>Scan code</Button>
                {consent}
                <hr />
                {contents}
            </React.Fragment>
        );
    }
}

Barcode.contextType = AppContext;