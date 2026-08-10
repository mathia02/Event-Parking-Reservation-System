using EventParkingReservationSystem.API.Services.Interfaces;
using System.Net;
using System.Net.Mail;

namespace EventParkingReservationSystem.API.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;


        public EmailService(
            IConfiguration configuration
        )
        {
            _configuration = configuration;
        }


        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string htmlBody
        )
        {
            var host =
                _configuration["EmailSettings:Host"]
                ?? throw new InvalidOperationException(
                    "Email SMTP host is not configured."
                );


            var portText =
                _configuration["EmailSettings:Port"];


            if (!int.TryParse(
                portText,
                out int port
            ))
            {
                port = 587;
            }


            var username =
                _configuration["EmailSettings:Username"]
                ?? throw new InvalidOperationException(
                    "Email username is not configured."
                );


            var password =
                _configuration["EmailSettings:Password"]
                ?? throw new InvalidOperationException(
                    "Email password is not configured."
                );


            var fromEmail =
                _configuration["EmailSettings:FromEmail"]
                ?? username;


            var fromName =
                _configuration["EmailSettings:FromName"]
                ?? "EventPark";


            using var message =
                new MailMessage();


            message.From =
                new MailAddress(
                    fromEmail,
                    fromName
                );


            message.To.Add(
                new MailAddress(
                    toEmail
                )
            );


            message.Subject =
                subject;


            message.Body =
                htmlBody;


            message.IsBodyHtml =
                true;


            using var smtpClient =
                new SmtpClient(
                    host,
                    port
                );


            smtpClient.EnableSsl =
                true;


            smtpClient.Credentials =
                new NetworkCredential(
                    username,
                    password
                );


            await smtpClient.SendMailAsync(
                message
            );
        }
    }
}
