
import "../../css//ResumePreview.css";
import DefaultTemplate from "./templates/DefaultTemplate";
import SplitTemplate from "./templates/SplitTemplate";
import WideLeftTemplate from "./templates/WideLeftTemplate";

const ResumePreview = ({ data, template = "Default", theme = "Light" }) => {
    if (!data) return null;

    const templates = {
        "Default": DefaultTemplate,
        "Split": SplitTemplate,
        "Wide Left": WideLeftTemplate
    };

    const SelectedTemplate = templates[template] || DefaultTemplate;

    return (
        <div className="resume-preview">
            <SelectedTemplate data={data} theme={theme} />
        </div>
    );
};

export default ResumePreview;