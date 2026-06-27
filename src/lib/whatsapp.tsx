import * as React from "react";

/**
 * Sanitizes a phone number and generates a wa.me URL with a prefilled payment reminder.
 */
export function getWhatsAppReminderUrl(
  phone: string,
  customerName: string,
  outstandingAmount: number,
  outletName?: string,
): string {
  // Remove non-digit characters
  let sanitizedPhone = phone.replace(/\D/g, "");

  // If it's a 10-digit number, assume India (+91)
  if (sanitizedPhone.length === 10) {
    sanitizedPhone = `91${sanitizedPhone}`;
  }

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(outstandingAmount);

  const message = `Dear ${customerName},\nThis is a friendly reminder that you have a pending balance of ${formattedAmount} with ${outletName || "us"}. Please clear it at your earliest convenience.\nThank you!`;

  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.515 0 10.002-4.49 10.005-10.01.002-2.673-1.03-5.187-2.907-7.067C16.597 1.647 14.092.617 11.422.617c-5.524 0-10.014 4.49-10.017 10.01-.001 1.764.464 3.486 1.347 5.016L1.73 21.037l5.503-1.442-1.586-.441zM16.518 13.5c-.27-.135-1.597-.788-1.845-.878-.247-.09-.427-.135-.607.135-.18.27-.697.878-.855 1.058-.158.18-.315.202-.585.067-.27-.135-1.14-.42-2.172-1.341-.803-.715-1.345-1.6-1.503-1.87-.158-.27-.017-.417.118-.552.122-.121.27-.315.405-.472.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.608-1.463-.833-2.003-.218-.524-.46-.453-.63-.462-.165-.008-.353-.01-.54-.01-.188 0-.495.07-.754.36-.26.29-1.01.99-1.01 2.41 0 1.42 1.03 2.79 1.17 2.99.14.2 2.03 3.1 4.92 4.35.688.298 1.224.475 1.643.607.693.22 1.325.19 1.823.115.554-.08 1.697-.693 1.937-1.365.24-.672.24-1.248.169-1.365-.07-.116-.26-.202-.53-.337z" />
    </svg>
  );
}
