export function authErrorToMessage(err: string) {
    switch (err) {
        case "Configuration":
            return "Error while reaching server, please check your connection."; 
        case "AccessDenied":
            return "Access denied. Contact the developper if you think this is a mistake.";
        case "Verification":
            return "Token expired. Please try again, or contact the developper if the issue persists.";
        case "OAuthAccountNotLinked":
            return "An account using the same email already exists.";
        default:
            return "Unknown server error, please contact the developper.";
    }
}