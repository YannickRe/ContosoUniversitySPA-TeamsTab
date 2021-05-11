# Contoso University - Microsoft Teams Tab
This repository serves as the base code for my session "[4x10 minutes: Advanced Techniques in Microsoft Teams Tab Development](https://sessionize.com/s/yannick-reekmans/4x10_minutes_advanced_techniques_in/39492)". I use it to demonstrate four techniques that can take your Teams tab to the next level.

This code is provided without instructions or any support and is merely intended to be used for inspiration and show possible use cases for the lesser used techniques in Teams tab development.

## Base Code
The code is an adapted version of the [Contoso University implementation in ASP.net Core 5](https://github.com/dotnet/AspNetCore.Docs/tree/main/aspnetcore/data/ef-rp/intro/samples/cu50).
I used the ASP.net Core with Reactjs template in Visual Studio; as a result, I ended with:
- ASP.net Core WebAPI that uses Microsoft.Identity.Web to protect itself
- A React-based Single Page Application, with react-router for friendly URLs, that runs the whole front end
- The React-based front-end will call the .NET Core WebApi to fetch data

## Technique 1: Authentication
It shows off "a way" to handle multiple authentication scenario's:
- It can run as a standalone website and embedded in Microsoft Teams
- It does authentication with MSALjs v2. Both redirect and popup are supported in standalone mode
- It supports interactive authentication in Microsoft Teams, using the Teams-specific popup code
- It supports real Single Sign-on in Microsoft Teams
- It supports initial consent and additional consent when scopes change
- The front-end calls the backend API with authentication!
- The backend calls Microsoft Graph, using on-behalf-of authentication flow
- It supports switching between Interactive Auth and SSO Auth through the tab config page

## Technique 2: Deep linking
It shows off "a way" to handle deep linking: the ability to link to specific items within the Teams tab directly. In this case, it allows for direct links to a particular student or a particular course. 
As a second feature, it displays interactions with the Microsoft Teams client app capabilities, like starting a chat or scheduling a meeting!

## Technique 3: Activity feed notification
Microsoft Graph gives the ability to send notifications to the native Activity Feed inside the Microsoft Teams client application. The code shows off how that is done when the app is installed in the scope of a Team and displays how deep linking can be leveraged here.

## Technique 4: Device capabilities
Lastly, the app shows off a use case for integrating with device capabilities. It uses the phone camera as a barcode scanner to scan "Student ID" and open up the student's profile page in the backend system.
