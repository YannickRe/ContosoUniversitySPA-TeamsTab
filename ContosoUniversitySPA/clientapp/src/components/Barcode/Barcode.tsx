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
        if (this.state.studentDetailUrl) {
            return <React.Fragment>
                        <Redirect to={this.state.studentDetailUrl} />
                    </React.Fragment>;
        }
        
        let errorMessage = null;
        if (this.state.error) {
            errorMessage = <React.Fragment>
                            <div className="alert alert-danger" role="alert">
                                <h4 className="alert-heading">An error occurred</h4>
                                <p>We regret to inform you that an error has occurred while scanning the QR code, more details below.</p>
                                <hr />
                                <p className="mb-0"><pre>{this.state.error}</pre></p>
                            </div>
                        </React.Fragment>;

        }
        return  <React.Fragment>
                    {errorMessage}
                    <div className="jumbotron">
                        <h1 className="display-4">Scan Student Card</h1>
                        <p className="lead">Contoso University application can find a specific Student profile by scanning the Student Card.</p>
                        <hr className="my-4" />
                        <p>{this.state.consent}</p>
                        <p className="lead">
                            <Button color="primary" className="btn-lg" onClick={async () => await this.scanCode()}>Scan code</Button>
                        </p>
                    </div>
                </React.Fragment>;
    }
}

Barcode.contextType = AppContext;