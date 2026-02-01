import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import React from 'react';

export const InviteEmail = ({ clinicName, senderName, inviteLink }) => {
    return (
        <Html>
            <Head />
            <Preview>Invitación a colaborar en {clinicName}</Preview>
            <Tailwind>
                <Body className="bg-[#f9fafb] my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] bg-white rounded my-[40px] mx-auto p-[20px] max-w-[465px] shadow-sm">
                        <Section className="mt-[32px]">
                            {/* Logo / Círculo central */}
                            <div className="bg-[#50e3c2] w-12 h-12 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <span className="text-[#101828] font-bold text-xl">A</span>
                            </div>
                        </Section>

                        <Heading className="text-[#101828] text-[24px] font-semibold text-center p-0 my-[30px] mx-0">
                            Invitación a <strong>{clinicName}</strong>
                        </Heading>

                        <Text className="text-[#374151] text-[14px] leading-[24px]">
                            Hola,
                        </Text>

                        <Text className="text-[#374151] text-[14px] leading-[24px]">
                            <strong>{senderName}</strong> te ha invitado a unirte a su red profesional en <strong>Adaptia</strong>.
                            Al aceptar, podrás gestionar pacientes y citas manteniendo siempre la soberanía y privacidad de tus datos profesionales.
                        </Text>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#101828] rounded-xl text-white text-[14px] font-bold no-underline text-center px-6 py-4"
                                href={inviteLink}
                            >
                                Aceptar Invitación
                            </Button>
                        </Section>

                        <Text className="text-[#374151] text-[14px] leading-[24px]">
                            O copia y pega esta URL en tu navegador:{" "}
                            <br />
                            <a href={inviteLink} className="text-[#0070f3] no-underline">
                                {inviteLink}
                            </a>
                        </Text>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Text className="text-[#6b7280] text-[12px] leading-[20px]">
                            Este mensaje fue enviado por el sistema de gestión de Adaptia. Si no esperabas esta invitación, puedes ignorar este correo.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default InviteEmail;