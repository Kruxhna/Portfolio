import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function PyTorchLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12.923 1.01a9.23 9.23 0 0 0-4.05 1.047l1.79 1.79a6.69 6.69 0 0 1 2.26-.507c3.71 0 6.72 3.01 6.72 6.72a6.69 6.69 0 0 1-.507 2.26l1.79 1.79a9.23 9.23 0 0 0 1.047-4.05c0-5.1-4.14-9.24-9.24-9.24h-.18l.18.19zM6.55 4.39a9.23 9.23 0 0 0-3.69 6.67c0 5.1 4.14 9.24 9.24 9.24 3.05 0 5.76-1.48 7.46-3.75l-1.85-1.85a6.69 6.69 0 0 1-5.61 2.9c-3.71 0-6.72-3.01-6.72-6.72 0-1.87.77-3.56 2.01-4.78l-1.84-1.85.004.14z" />
      <circle cx="16.3" cy="5.5" r="1.5" fill="#EE4C2C" />
    </svg>
  );
}

export function TensorFlowLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12 2l8.5 4.9v9.8L12 21.6l-8.5-4.9V6.9L12 2zm0 2.3L5.5 8.1v7.6L12 19.4l6.5-3.7V8.1L12 4.3z" fill="#FF6F00" />
      <path d="M11 7h2v10h-2z" fill="#FFA800" />
      <path d="M8 9h8v2H8z" fill="#FFA800" />
    </svg>
  );
}

export function HuggingFaceLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
    </svg>
  );
}

export function OpenCVLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="7" r="4" stroke="#EA4335" />
      <circle cx="7" cy="16" r="4" stroke="#4285F4" />
      <circle cx="17" cy="16" r="4" stroke="#34A853" />
    </svg>
  );
}

export function ScikitLearnLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <circle cx="8" cy="8" r="4" fill="#F89939" />
      <circle cx="16" cy="16" r="4" fill="#3499CD" />
      <path d="M10 10l4 4" stroke="#ECC3AB" strokeWidth="2" />
    </svg>
  );
}

export function LangChainLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function NumPyLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#4DABCF" />
      <path d="M7 17V7l10 10V7" stroke="#4DABCF" />
    </svg>
  );
}

export function PandasLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <rect x="4" y="6" width="3" height="12" rx="1" fill="#150458" />
      <rect x="10" y="4" width="3" height="16" rx="1" fill="#E70488" />
      <rect x="16" y="8" width="3" height="10" rx="1" fill="#FFD43B" />
    </svg>
  );
}

export function PythonLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M11.91 2c-3.1 0-2.9 1.34-2.9 1.34l.03 1.39h2.95v.42H6.07S4 4.9 4 8.01s1.82 2.98 1.82 2.98h1.09v-1.53s-.06-1.83 1.8-1.83h3.11s1.75.03 1.75-1.7V4.08S13.79 2 11.91 2zm-1.6 1.05a.55.55 0 1 1 0 1.1.55.55 0 0 1 0-1.1zM12.09 22c3.1 0 2.9-1.34 2.9-1.34l-.03-1.39h-2.95v-.42h5.92S20 19.1 20 15.99s-1.82-2.98-1.82-2.98h-1.09v1.53s.06 1.83-1.8 1.83h-3.11s-1.75-.03-1.75 1.7v1.85s-.22 2.08 1.66 2.08zm1.6-1.05a.55.55 0 1 1 0-1.1.55.55 0 0 1 0 1.1z" fill="#3776AB" />
    </svg>
  );
}

export function CppLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.5 9.4 7.55 4.24a2 2 0 0 0-2 0L2.5 5.99a2 2 0 0 0-1 1.73v8.56a2 2 0 0 0 1 1.73l3.05 1.76a2 2 0 0 0 2 0l8.95-5.17" stroke="#00599C" />
      <path d="M18 9v6m-3-3h6" stroke="#00599C" />
      <path d="M22 9v6m-3-3h6" stroke="#00599C" />
    </svg>
  );
}

export function SQLLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

export function TSLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="3" fill="#3178C6" />
      <path d="M7 9h6v2H11v7H9v-7H7V9zm8 2.5c0-.8.7-1.5 1.5-1.5h3.5v2h-3v1h2c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2h-4v-2h3.5v-1h-2c-1.1 0-2-.9-2-2v-1.5z" fill="#ECC3AB" />
    </svg>
  );
}

export function DockerLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M13 8h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6-3h2v2h-2zm-3 0h2v2h-2zm9 7c-.2-.1-.7-.2-1.3-.1-.4-.6-1-1.1-1.8-1.3l-.6-.2-.3.5c-.4.6-.5 1.4-.4 2.1-.8.5-2.2.6-3.6.6H3c-.6 0-1 .4-1 1 0 4.4 3.6 8 8 8 5.7 0 10.3-4.1 11-9.5.6-.2 1.2-.6 1.6-1.1l.3-.4-.9-.6z" fill="#2496ED" />
    </svg>
  );
}

export function FastAPILogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" fill="#059669" />
      <path d="M13 4L6 14h5l-1 6 7-10h-5l1-6z" fill="#ECC3AB" />
    </svg>
  );
}

export function FlaskLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
    </svg>
  );
}

export function GitLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M21.6 10.9L13.1 2.4c-.6-.6-1.5-.6-2.1 0l-2 2 2.6 2.6c.6-.2 1.3 0 1.8.4.5.5.7 1.2.5 1.8l2.5 2.5c.6-.2 1.3 0 1.8.4.7.7.7 1.9 0 2.6s-1.9.7-2.6 0c-.5-.5-.7-1.3-.5-1.9l-2.4-2.4v5.3c.2.2.3.5.3.8 0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5c0-.6.4-1.2 1-1.4V9.8c-.6-.2-1-.8-1-1.4 0-.4.1-.7.3-1L7.3 4.8 2.4 9.7c-.6.6-.6 1.5 0 2.1l8.5 8.5c.6.6 1.5.6 2.1 0l8.6-8.6c.6-.6.6-1.5 0-2.1l-.1-.2z" fill="#F05032" />
    </svg>
  );
}

export function LinuxLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export function CloudLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}

export function WandbLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12 2l4 7-4 7-4-7 4-7zm-7 7l4 7-4 7-4-7 4-7zm14 0l4 7-4 7-4-7 4-7z" fill="#FFBE00" />
    </svg>
  );
}

export function DSALogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <line x1="12" y1="8" x2="6" y2="15" />
      <line x1="12" y1="8" x2="18" y2="15" />
    </svg>
  );
}

export function OOPLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function DBMSLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

export function OSLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="15" x2="4" y2="15" />
    </svg>
  );
}
