import { faFile, faFileAudio, faFilePdf, faFileVideo, faFileZipper, faFont, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IMimeTypeIconProps } from "../types";

/**
 * This component returns icons for some file types. If all conditions are not met, it returns the default file icon.
 * @param { IMimeTypeIconProps } props
 * @returns { JSX.Element }
 */
export default function MimeTypeIcon(props: IMimeTypeIconProps): JSX.Element {
  const { type } = props;
  if (type.includes("image")) {
    // Image Files
    return <FontAwesomeIcon icon={faImage} />;
  } else if (type.includes("audio")) {
    // Audio Files
    return <FontAwesomeIcon icon={faFileAudio} />;
  } else if (type.includes("font")) {
    // Font Files
    return <FontAwesomeIcon icon={faFont} />;
  } else if (type.includes("video")) {
    // Video Files
    return <FontAwesomeIcon icon={faFileVideo} />;
  } else if (type.includes("pdf")) {
    // PDF
    return <FontAwesomeIcon icon={faFilePdf} />;
  } else if (type.includes("zip") || type.includes("x-tar") || type.includes("gzip") || type.includes("x-7z-compressed")) {
    // Archive Files
    return <FontAwesomeIcon icon={faFileZipper} />;
  } else {
    // Fallback Icon
    return <FontAwesomeIcon icon={faFile} />;
  }
}
