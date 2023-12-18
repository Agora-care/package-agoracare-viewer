# AgoraCare Viewer

AgoraCare Viewer which will make the `agoracare-viewer` HTML tag available.

The `agoracare-viewer` is a custom element that will load a serie from the AgoraCare API.

You can find more information about using custom elements and shadow dom in the following documentation:

- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)

## API

### Attributes

| Attribute     | Description   | Type   | Required |
| ------------- | ------------- | ------ | -------- |
| access-token  | An access token that will be used to authenticate with the Agora API | String | Yes |
| agoracare-id  | The ID of the Agora Care to load | String | Yes |
| study-series  | The series to load | String | Yes |

Series must be a study instance UID and a series instance UID separated by a dash.

Example of a series:

```javascript
2.25.329080180065308379415950950952-2.25.329080180065308379415950950953
```

## Usages

You can import the `agoracare-viewer` in your HTML file like this:

```html
<script type="module" src="https://package.agoracare.ch/agoracare-viewer.min.js"></script>
```

Then you can use the `agoracare-viewer` custom element like this:

```html
<agoracare-viewer
  access-token="${accessToken}"
  agoracare-id="${agoracareId}"
  study-series="${studyInstanceUID}-${seriesInstanceUID}"
>
</agoracare-viewer>
```

The `agoracareId` is in the format `XXXX-XXX-XXXX`.

The following permission for the Content-Security-Policy are required to allow the AgoraCare Viewer to load the series using the AgoraCare API:

```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' *.agoracare.ch; script-src-elem https://package.agoracare.ch; img-src blob:; style-src 'self' https://package.agoracare.ch;" />
``````

## Example

You can find an example of the AgoraCare Viewer in the `example` folder.

The folder will contain an `index.html` file that will load the `agoracare-viewer` custom element and will connect to the Agora Care IDP.

A `.devcontainer` folder is also available to run the example in a Docker container. You can find more information about the Visual Studio Code Remote - Containers extension [here](https://code.visualstudio.com/docs/remote/containers). This example connects with the dev oidc client, and only users marked as dev users can connect using this client. User AC-1111-111-1115 is a dev user.
