import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || '100x Socials <noreply@joshuapaul.site>';

const THEME = {
  bg: '#151515',
  surface: '#1c1c1c',
  surfaceHigh: '#262626',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  content: '#f3efe8',
  muted: '#9c958a',
  accent: '#94d7f2',
  accentSoft: 'rgba(148, 215, 242, 0.12)',
  success: '#7bd9ab',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function renderEmailLayout({
  preheader,
  eyebrow,
  title,
  body,
  footer,
}: {
  preheader: string;
  eyebrow: string;
  title: string;
  body: string;
  footer: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0; padding:0; background:${THEME.bg}; color:${THEME.content}; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; visibility:hidden;">
          ${escapeHtml(preheader)}
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:${THEME.bg};">
          <tr>
            <td align="center" style="padding:40px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; max-width:600px;">
                <tr>
                  <td style="padding-bottom:16px; text-align:center;">
                    <div style="display:inline-flex; align-items:center; gap:12px;">
                      <span style="display:inline-block; width:48px; height:48px; line-height:48px; border-radius:18px; background:#212529; border:1px solid rgba(255,255,255,0.08); color:#f8f9fa; font-size:13px; font-weight:900; letter-spacing:-0.08em; text-align:center; box-shadow:0 14px 30px rgba(0,0,0,0.12);">
                        100x
                      </span>
                      <span style="display:inline-block; text-align:left;">
                        <span style="display:block; color:${THEME.content}; font-size:17px; font-weight:700; letter-spacing:-0.02em;">100x Socials</span>
                        <span style="display:block; color:${THEME.muted}; font-size:12px; margin-top:2px;">Private network for builders</span>
                      </span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="border:1px solid ${THEME.border}; border-radius:30px; overflow:hidden; background:linear-gradient(180deg, ${THEME.surface} 0%, ${THEME.surfaceHigh} 100%); box-shadow:0 28px 60px rgba(0,0,0,0.26);">
                    <div style="height:1px; background:linear-gradient(90deg, transparent, rgba(148,215,242,0.45), transparent);"></div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:36px 36px 28px 36px;">
                          <div style="color:${THEME.muted}; font-size:11px; font-weight:600; letter-spacing:0.16em; text-transform:uppercase;">
                            ${escapeHtml(eyebrow)}
                          </div>
                          <h1 style="margin:14px 0 0 0; color:${THEME.content}; font-size:34px; line-height:1.1; font-weight:700; letter-spacing:-0.03em; font-family:Manrope, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                            ${escapeHtml(title)}
                          </h1>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 36px 36px 36px;">
                          ${body}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 10px 0 10px; text-align:center;">
                    <p style="margin:0; color:${THEME.muted}; font-size:12px; line-height:1.7;">
                      ${footer}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function renderOtpEmail(otp: string): string {
  return renderEmailLayout({
    preheader: `Your 100x Socials login code is ${otp}. It expires in 10 minutes.`,
    eyebrow: 'Secure sign-in',
    title: 'Your login code',
    body: `
      <p style="margin:0; color:${THEME.content}; font-size:16px; line-height:1.8;">
        Enter this code on <strong style="color:${THEME.content};">100x Socials</strong> to complete your sign-in.
        It stays valid for <strong style="color:${THEME.content};">10 minutes</strong>.
      </p>

      <div style="margin:28px 0 22px 0; padding:28px 24px; border-radius:24px; border:1px solid ${THEME.borderStrong}; background:${THEME.bg}; text-align:center;">
        <div style="margin:0; color:${THEME.accent}; font-size:42px; line-height:1; font-weight:800; letter-spacing:0.32em; font-family:'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace;">
          ${escapeHtml(otp)}
        </div>
      </div>

      <div style="padding:18px 20px; border-radius:20px; background:rgba(255,255,255,0.03); border:1px solid ${THEME.border};">
        <p style="margin:0; color:${THEME.muted}; font-size:14px; line-height:1.7;">
          If you didn&apos;t request this code, you can safely ignore this email.
          Someone may have entered your address by mistake.
        </p>
      </div>
    `,
    footer: '100x Socials · Private network for builders',
  });
}

function renderIntroductionEmail({
  toName,
  fromCompany,
  fromRecruiterEmail,
  message,
}: {
  toName: string;
  fromCompany: string;
  fromRecruiterEmail: string;
  message?: string;
}): string {
  const safeName = toName.trim() || 'there';
  const safeCompany = fromCompany.trim() || 'A recruiter';

  return renderEmailLayout({
    preheader: `${safeCompany} wants to connect with you through 100x Socials.`,
    eyebrow: 'Recruiter outreach',
    title: `Hi ${safeName},`,
    body: `
      <p style="margin:0; color:${THEME.content}; font-size:16px; line-height:1.8;">
        <strong style="color:${THEME.content};">${escapeHtml(safeCompany)}</strong> came across your profile on
        <strong style="color:${THEME.content};">100x Socials</strong> and wants to connect regarding an opportunity.
      </p>

      <div style="margin:24px 0 0 0; display:flex; flex-wrap:wrap; gap:10px;">
        <span style="display:inline-block; padding:10px 14px; border-radius:999px; border:1px solid ${THEME.border}; background:${THEME.surfaceHigh}; color:${THEME.content}; font-size:13px; font-weight:600;">
          Company: ${escapeHtml(safeCompany)}
        </span>
        <span style="display:inline-block; padding:10px 14px; border-radius:999px; border:1px solid ${THEME.border}; background:${THEME.surfaceHigh}; color:${THEME.content}; font-size:13px; font-weight:600;">
          Reply-to: ${escapeHtml(fromRecruiterEmail)}
        </span>
      </div>

      ${message?.trim()
        ? `
          <div style="margin-top:26px; padding:22px 22px; border-radius:24px; border:1px solid rgba(148,215,242,0.18); background:${THEME.accentSoft};">
            <div style="color:${THEME.muted}; font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:12px;">
              Message from ${escapeHtml(safeCompany)}
            </div>
            <p style="margin:0; color:${THEME.content}; font-size:15px; line-height:1.8;">
              ${nl2br(message.trim())}
            </p>
          </div>
        `
        : ''
      }

      <div style="margin-top:26px; padding-top:22px; border-top:1px solid ${THEME.border};">
        <p style="margin:0; color:${THEME.muted}; font-size:14px; line-height:1.8;">
          You can reply directly to this email to get in touch with the recruiter at
          <strong style="color:${THEME.content};"> ${escapeHtml(fromRecruiterEmail)}</strong>.
        </p>
      </div>
    `,
    footer: 'Sent via 100x Socials · Reply directly to continue the conversation',
  });
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: '🔐 Your 100x Socials Login Code',
    html: renderOtpEmail(otp),
  });
}

export async function sendIntroductionEmail(
  toEmail: string,
  toName: string,
  fromCompany: string,
  fromRecruiterEmail: string,
  message?: string,
  subject?: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: subject || `👋 Introduction from ${fromCompany} via 100x Socials`,
    html: renderIntroductionEmail({
      toName,
      fromCompany,
      fromRecruiterEmail,
      message,
    }),
    replyTo: fromRecruiterEmail,
  });
}
