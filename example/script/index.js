const {
  UserManager,
} = window.oidc;

const uri = "http://localhost:5500/example";

const IDENTITY_REDIRECT_URI = `${uri}/index.html`;

export const IDENTITY_CONFIG = {
  authority: "https://idp.agoracare.ch/realms/agoracare",
  client_id: "agoracare-web-dev",
  redirect_uri: IDENTITY_REDIRECT_URI,
  silent_redirect_uri: `${uri}/silent-renew.html`,
  post_logout_redirect_uri: uri,
  response_type: "code",
  scope: "openid patient",
  automaticSilentRenew: true,
};

class AuthService {
  constructor() {
    this.userManager = new UserManager(IDENTITY_CONFIG);

    this.userManager.events.addSilentRenewError(() => {
      this.login();
    });

    this.userManager.events.addUserLoaded((user) => {
      this.user = user;
      const { access_token } = user;
      const agoraViewer = document.getElementById("agoracare-viewer");
      if (agoraViewer !== null) {
        agoraViewer.setAttribute("access-token", access_token);
      }
    });

    this.userManager.events.addAccessTokenExpired(() => {
      this.logout();
    });

    this.userManager.events.addUserSignedOut(() => {
      this.login();
    });
  }

  async isLogin() {
    const user = await this.userManager.getUser();
    return user !== null && !user.expired;
  }

  logout() {
    return this.userManager.signoutRedirect({ post_logout_redirect_uri: IDENTITY_REDIRECT_URI });
  }

  login() {
    return this.userManager.signinRedirect();
  }
}

const login = async () => {
  const parsedUrl = new URL(window.location.href);
  const state = parsedUrl.searchParams.get("state");

  if (state !== null) {
    authService.userManager.signinRedirectCallback().then((user) => {
      window.location.replace(
        IDENTITY_REDIRECT_URI,
      );    
    }).catch((err) => {
      console.error(err);
    });
  } else {
    if (!(await authService.isLogin())) {
      authService.login();
    }
  }

  return await authService.userManager.getUser();
};

const retrieveStudies = (agoraID, access_token) => {
  const url = `https://api.agoracare.ch/${agoraID}/studies`;
  const options = {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

  return fetch(url, options).then((response) => response.json());
};

const initSelect = async (agoraID, accessToken) => {
  const studies = await retrieveStudies(agoraID, accessToken);
  const seriesElement = document.getElementById("series");

  studies.forEach((study) => {
    const { studyInstanceUID } = study;

    study.series.forEach((serie) => {
      if (serie.type === "volume") {
        const { seriesInstanceUID } = serie;
        const option = document.createElement("option");
        option.value = `${studyInstanceUID} ${seriesInstanceUID}`;
        option.text = `volume ${seriesInstanceUID}`;
        seriesElement.appendChild(option);
      } else if (serie.type === "pdf_documents") {
        const { seriesInstanceUID } = serie;
        const option = document.createElement("option");
        option.value = `${studyInstanceUID} ${seriesInstanceUID}`;
        option.text = `pdf ${seriesInstanceUID}`;
        seriesElement.appendChild(option);
      }
    });
  });

  seriesElement.addEventListener("change", (event) => {
    const [studyInstanceUID, seriesInstanceUID] = seriesElement.value.split(" ");
    const agoraViewer = document.getElementById("agoracare-viewer");

    agoraViewer.setAttribute("study-series", `${studyInstanceUID}-${seriesInstanceUID}`);
  });

  return seriesElement;
}

const initAgoraViewer = (accessToken, agoraID, studyInstanceUID, seriesInstanceUID) => {
  const agoraViewerContainer = document.getElementById("agoracare-viewer-container");
  const agoraViewer = document.createElement("agoracare-viewer");
  agoraViewer.setAttribute("id", "agoracare-viewer");
  agoraViewer.setAttribute("class", "agoraViewer");
  agoraViewer.setAttribute("access-token", accessToken);
  agoraViewer.setAttribute("agoracare-id", agoraID);
  agoraViewer.setAttribute("study-series", `${studyInstanceUID}-${seriesInstanceUID}`);

  agoraViewerContainer.appendChild(agoraViewer);

  return agoraViewer;
};

const authService = new AuthService();
login().then(
  async (user) => {
    if (user !== null) {
      const { access_token } = user;
      const { agora_id } = user.profile;
      const seriesElement = await initSelect(agora_id, access_token);

      const [studyInstanceUID, seriesInstanceUID] = seriesElement.value.split(" ");
      initAgoraViewer(access_token, agora_id, studyInstanceUID, seriesInstanceUID);
    }
  },
);

const logoutButton = document.getElementById("logout-button");
if (logoutButton !== null) {
  logoutButton.addEventListener("click", () => {
    authService.logout();
  });
}
