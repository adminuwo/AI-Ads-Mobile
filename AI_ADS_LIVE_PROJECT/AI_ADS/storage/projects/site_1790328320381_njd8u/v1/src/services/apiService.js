/**
 * Client API Service Handler
 */
export async function submitContactForm(formData) {
  console.log('[API Service] Contact Form Submitted:', formData);
  return { success: true, message: 'Thank you! Your message has been received.' };
}

export async function submitBookingForm(bookingData) {
  console.log('[API Service] Booking Request Submitted:', bookingData);
  return { success: true, message: 'Booking request confirmed! We will get in touch shortly.' };
}

export async function submitCustomOrder(orderData) {
  console.log('[API Service] Custom Order Submitted:', orderData);
  return { success: true, message: 'Custom enquiry received! Our team will contact you soon.' };
}
