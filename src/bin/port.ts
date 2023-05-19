const DEFAULT_PORT = 8080;

/**
 * Accept in a desired port number, perform some operations and return
 * the actual port the server will use.
 *
 * @param port the desired port the server should use
 * @returns {number} the actual port the server will use
 *
 * @author Michael Coughlan
 */
export const setPortNumber = (port?: string): number => {
    if (!port) {
        return DEFAULT_PORT;
    }

    let tempPort = parseInt(port, 10);

    if (tempPort < 1) {
        return DEFAULT_PORT;
    }

    return tempPort;
};