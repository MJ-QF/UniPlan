import "./PersonalInfoFields.css";
import MajorSelect from "./MajorSelect";
import type { MajorResponse } from "../../types/student";

export interface PersonalInfoValues {
  firstName: string;
  middleName: string;
  lastName: string;
  accountName: string;
  email: string;
  majorID: string;
}

export const emptyPersonalInfo: PersonalInfoValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  accountName: "",
  email: "",
  majorID: "",
};

// لإضافة معلومة جديدة: أضف حقلها بـ PersonalInfoValues و emptyPersonalInfo وهون
const TEXT_FIELDS: {
  name: Exclude<keyof PersonalInfoValues, "majorID">;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  { name: "firstName", label: "الاسم الأول", placeholder: "أدخل الاسم الأول" },
  { name: "middleName", label: "الاسم الأوسط", placeholder: "أدخل الاسم الأوسط" },
  { name: "lastName", label: "الكنية", placeholder: "أدخل الكنية" },
  { name: "accountName", label: "اسم المستخدم", placeholder: "أدخل اسم المستخدم" },
  { name: "email", label: "البريد الإلكتروني", placeholder: "name@university.edu", type: "email" },
];

interface Props {
  values: PersonalInfoValues;
  onChange: (field: keyof PersonalInfoValues, value: string) => void;
  majors: MajorResponse[];
  majorsLoading?: boolean;
  majorsError?: string;
  onRetryMajors?: () => void;
  disabled?: boolean;
  /** true = بيندمج بشبكة الفورم الأب (SignUp) وبياخد ستايل form-group تبعو */
  flat?: boolean;
}

export default function PersonalInfoFields({
  values,
  onChange,
  majors,
  majorsLoading = false,
  majorsError = "",
  onRetryMajors,
  disabled = false,
  flat = false,
}: Props) {
  const groupClass = flat ? "form-group" : "pi-group";

  return (
    <div className={flat ? "pi-grid pi-grid--flat" : "pi-grid"}>
      {TEXT_FIELDS.map((f) => (
        <div className={groupClass} key={f.name}>
          <label htmlFor={`pi-${f.name}`}>{f.label}</label>
          <input
            id={`pi-${f.name}`}
            type={f.type ?? "text"}
            value={values[f.name]}
            placeholder={f.placeholder}
            disabled={disabled}
            required
            onChange={(e) => onChange(f.name, e.target.value)}
          />
        </div>
      ))}

      <div className={groupClass}>
        <label>الاختصاص</label>
        <MajorSelect
          majors={majors}
          value={values.majorID}
          onChange={(v) => onChange("majorID", v)}
          loading={majorsLoading}
          error={majorsError}
          onRetry={onRetryMajors}
          disabled={disabled}
        />
      </div>
    </div>
  );
}