const field =
  "min-h-[48px] w-full rounded-[9px] border border-border bg-background px-3.5 text-white transition duration-200";

export const auth = {
  page: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background bg-[radial-gradient(ellipse_at_15%_15%,#6d3be825,transparent_38%),radial-gradient(ellipse_at_85%_85%,#a855f725,transparent_35%)] px-5 py-10 max-[480px]:px-[15px] max-[480px]:py-7",

  logo: "mb-7 inline-block font-heading text-[32px] font-extrabold tracking-[-1px] whitespace-nowrap text-[#f8fafc] [text-shadow:0_0_25px_#8b5cf650] max-[480px]:text-[29px]",
  logoAccent: "text-primary-light",

  card: "w-full max-w-[460px] rounded-[20px] border border-[#49316d] bg-[#151126ee] p-[38px] shadow-[0_20px_70px_#00000055] backdrop-blur-[15px] max-[480px]:px-[18px] max-[480px]:py-[25px]",

  heading: "mb-7 text-center",
  eyebrow: "text-xs leading-[1.6] font-bold tracking-[2px] text-primary-light",
  title: "mt-3 font-heading text-[29px] font-bold max-[480px]:text-[25px]",
  subtitle: "mt-2.5 text-sm leading-[1.7] text-muted",

  form: "flex flex-col gap-3",
  label: "mt-2 text-[13px] font-semibold text-[#e2e8f0]",

  input: `${field} placeholder:text-[#777187] focus:border-primary-light focus:shadow-[0_0_0_3px_#8b5cf620] focus:outline-none`,

  passwordWrap: `${field} flex items-center gap-2.5 focus-within:border-primary-light focus-within:shadow-[0_0_0_3px_#8b5cf620]`,
  passwordInput:
    "w-full min-w-0 border-0 bg-transparent text-white outline-none placeholder:text-[#777187]",
  passwordToggle:
    "cursor-pointer border-0 bg-transparent text-xs whitespace-nowrap text-primary-light",

  extra: "my-[7px] flex items-center justify-between gap-2.5 text-xs",
  remember: "flex items-center gap-[7px] text-[#b8becc]",
  checkbox: "accent-primary",
  link: "text-primary-light hover:text-white",

  submit:
    "mt-2 w-full cursor-pointer rounded-[9px] border-0 bg-[linear-gradient(110deg,#7c3aed,#9b5cf6)] p-3.5 font-bold text-white shadow-[0_6px_22px_#8b5cf630] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_28px_#8b5cf655] active:scale-[0.98]",
  error: "text-[13px] leading-normal text-danger",

  switchText:
    "mt-10 mb-2.5 text-center text-[13px] leading-[1.7] text-[#b8becc]",
  switchLink: "font-bold text-primary-light hover:text-white",
  footer: "mt-[25px] text-center text-xs text-[#777187]",

  /* khusus register */
  roleHeading: "mb-3.5",
  roleLabel: "block text-sm font-bold text-[#f8fafc]",
  roleHint: "mt-[5px] text-[13px] text-muted",
  roleGrid: "mb-[22px] grid grid-cols-2 gap-3 max-[480px]:grid-cols-1",
  roleCard:
    "relative flex min-h-[145px] cursor-pointer flex-col items-start gap-[9px] rounded-xl border p-[17px] text-left text-white transition-all duration-[250ms] hover:-translate-y-[3px] max-[480px]:min-h-[115px]",
  roleCardIdle:
    "border-border bg-background hover:border-primary hover:bg-[#1c1531]",
  roleCardSelected:
    "border-primary-light bg-[linear-gradient(145deg,#2a1c48,#151126)] shadow-[0_0_20px_#8b5cf625]",
  roleIcon:
    "flex size-10 items-center justify-center rounded-[10px] bg-[#8b5cf625] text-[21px]",
  roleName: "text-base font-bold",
  roleDesc: "text-[11px] leading-normal text-muted",
  roleCheck: "absolute top-3 right-3 text-[17px] font-bold text-[#c4b5fd]",
  notice:
    "rounded-[9px] border border-[#8b5cf640] bg-[#8b5cf615] px-3.5 py-3 text-xs leading-[1.7] text-[#d4c4ff]",
};