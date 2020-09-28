# Update the VARIANT arg in devcontainer.json to pick an Ubuntu version: focal (or ubuntu-20.04), bionic (or ubuntu-18.04)
ARG VARIANT="focal"
FROM buildpack-deps:${VARIANT}-curl

# This Dockerfile adds a non-root user with sudo access. Update the “remoteUser” property in
# devcontainer.json to use it. More info: https://aka.ms/vscode-remote/containers/non-root-user.
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Options for common setup script - SHA generated on release
ARG INSTALL_ZSH="true"
ARG UPGRADE_PACKAGES="true"
ARG COMMON_SCRIPT_SOURCE="https://raw.githubusercontent.com/microsoft/vscode-dev-containers/master/script-library/common-debian.sh"
ARG COMMON_SCRIPT_SHA="dev-mode"

# Install needed packages and setup non-root user. Use a separate RUN statement to add your own dependencies.
RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends curl ca-certificates 2>&1 \
    && curl -sSL  ${COMMON_SCRIPT_SOURCE} -o /tmp/common-setup.sh \
    && ([ "${COMMON_SCRIPT_SHA}" = "dev-mode" ] || (echo "${COMMON_SCRIPT_SHA} /tmp/common-setup.sh" | sha256sum -c -)) \
    && /bin/bash /tmp/common-setup.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/* /tmp/common-setup.sh

###
### Unix ODBC driver for MSSQL Server 2017
###
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -; \
    curl https://packages.microsoft.com/config/ubuntu/19.10/prod.list > /etc/apt/sources.list.d/mssql-release.list; \
    apt-get update \
    && ACCEPT_EULA=Y apt-get -y install msodbcsql17 mssql-tools unixodbc-dev

###
### Docker 19.03.8
###
RUN apt-get -y install docker.io

###
### Docker-compose 1.26.2
###
RUN curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose

RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y python3 python3-dev python3-pip python3-venv python3-behave

RUN ln -s /usr/bin/python3 /usr/bin/python & \
    ln -s /usr/bin/pip3 /usr/bin/pip

RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash
