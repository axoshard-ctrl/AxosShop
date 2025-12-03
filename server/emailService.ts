// Email service for sending notifications
// For production, integrate with: SendGrid, Mailgun, AWS SES, or Nodemailer
import nodemailer from 'nodemailer';
import "dotenv/config";

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  // Flag to simulate email sending in development
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private transporter: any = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter with environment variables or mock
   */
  private initializeTransporter(): void {
    // Check for email configuration
    const emailProvider = process.env.EMAIL_PROVIDER || 'mock';
    const emailFrom = process.env.EMAIL_FROM || 'noreply@axoshop.com';

    if (emailProvider === 'smtp' && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log('✅ Email service initialized with SMTP provider');
      } catch (error) {
        console.warn('⚠️  Failed to initialize SMTP transporter:', error);
        this.transporter = null;
      }
    } else if (emailProvider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // For SendGrid, you'd use their Node.js library instead
      console.log('📧 SendGrid integration not yet implemented. Using mock email service.');
    } else {
      console.log('📧 Email service configured to log emails to console (development mode)');
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(email: string, orderData: {
    orderId: string;
    customerName: string;
    totalAmount: string;
    items: Array<{ productName: string; quantity: number; price: string }>;
  }): Promise<void> {
    const html = this.generateOrderConfirmationTemplate(orderData);
    await this.sendEmail({
      to: email,
      subject: `Order Confirmation - #${orderData.orderId.slice(0, 8)}`,
      html,
    });
  }

  /**
   * Send password reset email with token
   */
  async sendPasswordResetEmail(email: string, token: string, resetLink: string): Promise<void> {
    const html = this.generatePasswordResetTemplate({ email, token, resetLink });
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request - AxosShop',
      html,
    });
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(email: string, orderData: {
    orderId: string;
    status: string;
    trackingNumber?: string;
    carrier?: string;
  }): Promise<void> {
    const html = this.generateOrderStatusTemplate(orderData);
    await this.sendEmail({
      to: email,
      subject: `Order Update - #${orderData.orderId.slice(0, 8)} is ${orderData.status}`,
      html,
    });
  }

  /**
   * Send product back in stock notification
   */
  async sendRestockNotification(email: string, productData: {
    productName: string;
    productLink: string;
  }): Promise<void> {
    const html = this.generateRestockTemplate(productData);
    await this.sendEmail({
      to: email,
      subject: `${productData.productName} is back in stock!`,
      html,
    });
  }

  /**
   * Send price drop notification
   */
  async sendPriceDropNotification(email: string, productData: {
    productName: string;
    oldPrice: string;
    newPrice: string;
    productLink: string;
  }): Promise<void> {
    const html = this.generatePriceDropTemplate(productData);
    await this.sendEmail({
      to: email,
      subject: `Price Drop: ${productData.productName} now ${productData.newPrice}`,
      html,
    });
  }

  /**
   * Send newsletter
   */
  async sendNewsletter(emails: string[], data: {
    subject: string;
    content: string;
    products?: Array<{ name: string; price: string; image: string }>;
  }): Promise<void> {
    const html = this.generateNewsletterTemplate(data);
    
    for (const email of emails) {
      await this.sendEmail({
        to: email,
        subject: data.subject,
        html,
      });
    }
  }

  /**
   * Send abandoned cart reminder
   */
  async sendAbandonedCartReminder(email: string, cartData: {
    customerName: string;
    cartTotal: string;
    checkoutLink: string;
    items: Array<{ name: string; price: string }>;
  }): Promise<void> {
    const html = this.generateAbandonedCartTemplate(cartData);
    await this.sendEmail({
      to: email,
      subject: `Don't forget your items! Complete your purchase`,
      html,
    });
  }

  /**
   * Core email sending method
   */
  private async sendEmail(template: EmailTemplate): Promise<void> {
    try {
      const emailFrom = process.env.EMAIL_FROM || 'noreply@axoshop.com';

      if (this.transporter) {
        // Send via SMTP
        const info = await this.transporter.sendMail({
          from: emailFrom,
          to: template.to,
          subject: template.subject,
          html: template.html,
        });
        console.log(`✅ Email sent to ${template.to}. Message ID: ${info.messageId}`);
      } else {
        // Development mode: log to console
        console.log(`\n📧 [EMAIL] To: ${template.to}`);
        console.log(`📧 [EMAIL] Subject: ${template.subject}`);
        console.log(`📧 [EMAIL] Preview: ${template.html.substring(0, 100)}...\n`);
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      // Don't throw - emails shouldn't block business logic
    }
  }

  // ============ Email Templates ============

  private generateOrderConfirmationTemplate(data: any): string {
    const itemsHtml = data.items
      .map(
        (item: any) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
          </tr>`
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; }
            .content { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your purchase, ${data.customerName}</p>
            </div>
            <div class="content">
              <p>Order #${data.orderId.slice(0, 8)}</p>
              <table>
                <thead>
                  <tr style="background-color: #f5f5f5;">
                    <th style="padding: 8px; text-align: left;">Product</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="font-weight: bold; font-size: 16px;">
                    <td colspan="2" style="padding: 8px;">Total:</td>
                    <td style="padding: 8px; text-align: right;">$${data.totalAmount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="footer">
              <p>You'll receive a shipping confirmation email soon!</p>
              <p>Questions? Contact support@axoshop.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateOrderStatusTemplate(data: any): string {
    const statusMessages: Record<string, string> = {
      pending: 'Your order is being processed',
      processing: 'We\'re preparing your order for shipment',
      shipped: `Your order is on the way! Tracking: ${data.trackingNumber || 'Coming soon'}`,
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .status-box { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }
            .tracking { background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Order Status Update</h2>
            <p>Order #${data.orderId.slice(0, 8)}</p>
            <div class="status-box">
              <h3>${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</h3>
              <p>${statusMessages[data.status] || 'Your order status has been updated'}</p>
            </div>
            ${
              data.trackingNumber
                ? `
              <div class="tracking">
                <h4>Tracking Information</h4>
                <p><strong>Carrier:</strong> ${data.carrier || 'N/A'}</p>
                <p><strong>Tracking #:</strong> ${data.trackingNumber}</p>
              </div>
            `
                : ''
            }
          </div>
        </body>
      </html>
    `;
  }

  private generateRestockTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Great News! 🎉</h2>
            <p><strong>${data.productName}</strong> is back in stock!</p>
            <p>This item was on your wishlist. Don't miss out - it might sell out again quickly!</p>
            <a href="${data.productLink}" class="cta-button">View Product</a>
          </div>
        </body>
      </html>
    `;
  }

  private generatePriceDropTemplate(data: any): string {
    const savings = (parseFloat(data.oldPrice) - parseFloat(data.newPrice)).toFixed(2);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .price-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .old-price { text-decoration: line-through; opacity: 0.8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Price Drop Alert! 💰</h2>
            <p><strong>${data.productName}</strong> price has dropped!</p>
            <div class="price-box">
              <p><span class="old-price">Was: $${data.oldPrice}</span></p>
              <h3>Now: $${data.newPrice}</h3>
              <p>Save: $${savings}</p>
            </div>
            <a href="${data.productLink}">Shop Now</a>
          </div>
        </body>
      </html>
    `;
  }

  private generateNewsletterTemplate(data: any): string {
    const productsHtml = data.products
      ? data.products
          .map(
            (product: any) =>
              `<div style="display: inline-block; width: 48%; margin: 1%; text-align: center;">
                <img src="${product.image}" style="width: 100%; max-width: 150px; border-radius: 5px;" />
                <p><strong>${product.name}</strong></p>
                <p>$${product.price}</p>
              </div>`
          )
          .join('')
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.subject}</h1>
            </div>
            <div style="margin: 20px 0;">
              ${data.content}
            </div>
            ${productsHtml ? `<div style="margin: 20px 0;">${productsHtml}</div>` : ''}
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              You received this email because you subscribed to AxosShop newsletter.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateAbandonedCartTemplate(data: any): string {
    const itemsHtml = data.items
      .map((item: any) => `<li>${item.name} - $${item.price}</li>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Don't forget your items, ${data.customerName}!</h2>
            <p>You have items waiting in your cart:</p>
            <ul>${itemsHtml}</ul>
            <p><strong>Total: ${data.cartTotal}</strong></p>
            <a href="${data.checkoutLink}" class="cta-button">Complete Your Purchase</a>
            <p style="font-size: 12px; color: #666;">This offer expires in 24 hours.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generatePasswordResetTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; }
            .token-box { background-color: #f5f5f5; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; font-family: monospace; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div style="margin: 20px 0;">
              <p>Hello,</p>
              <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
              
              <div class="token-box">
                <strong>Reset Code:</strong><br>
                ${data.token}
              </div>

              <p>Or use this link (if available):</p>
              <a href="${data.resetLink}" class="cta-button">Reset Password</a>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This reset code will expire in 24 hours. Never share this code with anyone.
              </div>

              <p>If you need help, contact us at support@axoshop.com</p>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>© AxosShop - All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
