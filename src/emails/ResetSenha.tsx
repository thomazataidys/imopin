import * as React from 'react'
import {
  Html,
  Body,
  Container,
  Text,
  Link,
  Heading,
  Button,
} from '@react-email/components'

interface ResetSenhaProps {
  name: string
  url: string
}

export default function ResetSenha({ name, url }: ResetSenhaProps) {
  return (
    <Html>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '5px', border: '1px solid #e8e8e8' }}>
          <Heading style={{ color: '#0f172a', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Recuperação de Senha — ImoPin
          </Heading>
          <Text style={{ color: '#334155', fontSize: '16px', lineHeight: '24px' }}>
            Olá, {name}!
          </Text>
          <Text style={{ color: '#334155', fontSize: '16px', lineHeight: '24px' }}>
            Recebemos uma solicitação para redefinir a senha da sua conta no ImoPin. Se você fez essa solicitação, clique no botão abaixo para escolher uma nova senha:
          </Text>
          <div style={{ margin: '24px 0' }}>
            <Button
              href={url}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              Redefinir minha senha
            </Button>
          </div>
          <Text style={{ color: '#64748b', fontSize: '14px', lineHeight: '20px' }}>
            Este link expira em 1 hora. Se você não solicitou a redefinição de senha, nenhuma ação adicional é necessária e sua senha continuará a mesma.
          </Text>
          <hr style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />
          <Text style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '16px' }}>
            Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:
            <br />
            <Link href={url} style={{ color: '#2563eb' }}>{url}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
