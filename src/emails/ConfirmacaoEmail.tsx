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

interface ConfirmacaoEmailProps {
  name: string
  url: string
}

export default function ConfirmacaoEmail({ name, url }: ConfirmacaoEmailProps) {
  return (
    <Html>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '5px', border: '1px solid #e8e8e8' }}>
          <Heading style={{ color: '#0f172a', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Confirme seu e-mail no ImoPin
          </Heading>
          <Text style={{ color: '#334155', fontSize: '16px', lineHeight: '24px' }}>
            Olá, {name}!
          </Text>
          <Text style={{ color: '#334155', fontSize: '16px', lineHeight: '24px' }}>
            Obrigado por se cadastrar na maior plataforma imobiliária de Pinheiro - MA. Para ativar sua conta, por favor, clique no botão abaixo:
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
              Confirmar minha conta
            </Button>
          </div>
          <Text style={{ color: '#64748b', fontSize: '14px', lineHeight: '20px' }}>
            Este link expira em 24 horas. Se você não realizou este cadastro, ignore este e-mail.
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
