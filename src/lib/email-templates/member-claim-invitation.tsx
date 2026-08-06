/**
 * React Email template for inviting members to claim their account.
 * Exports: template. Registered in lib/email-templates/registry.ts.
 */
import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

/**
 * Member claim invitation — the only email that carries a claim link.
 *
 * Copy is localised in-file (the four chapter languages) because members have
 * no reliable UI locale at send time; the caller passes the locale it knows
 * about and anything unknown falls back to English rather than failing.
 */
export type ClaimLocale = 'en' | 'de' | 'fr' | 'it'

export interface MemberClaimInvitationProps {
  claimUrl?: string
  firstName?: string
  expiresInDays?: number
  isResend?: boolean
  locale?: ClaimLocale
}

const COPY: Record<ClaimLocale, Record<string, string>> = {
  en: {
    subject: 'Activate your Member Area account',
    subjectResend: 'Your new Member Area activation link',
    preview: 'Set your password and activate your Member Area account.',
    heading: 'Activate your Member Area account',
    greeting: 'Hello',
    greetingPlain: 'Hello',
    intro:
      'You are a member of The Switzerland Chapter of ICF. Activate your Member Area account to manage your profile and your public directory listing.',
    resendIntro:
      'Here is a new activation link for your Member Area account. Any earlier link no longer works.',
    cta: 'Set my password',
    expiry: 'This link works once and expires in {days} days.',
    fallback: 'If the button does not work, copy this address into your browser:',
    ignore: 'If you were not expecting this email, you can safely ignore it.',
    signoff: 'The Switzerland Chapter of ICF',
  },
  de: {
    subject: 'Aktivieren Sie Ihr Mitgliederbereich-Konto',
    subjectResend: 'Ihr neuer Aktivierungslink für den Mitgliederbereich',
    preview: 'Passwort setzen und Ihr Mitgliederbereich-Konto aktivieren.',
    heading: 'Aktivieren Sie Ihr Mitgliederbereich-Konto',
    greeting: 'Hallo',
    greetingPlain: 'Hallo',
    intro:
      'Sie sind Mitglied von The Switzerland Chapter of ICF. Aktivieren Sie Ihr Konto im Mitgliederbereich, um Ihr Profil und Ihren öffentlichen Verzeichniseintrag zu verwalten.',
    resendIntro:
      'Hier ist ein neuer Aktivierungslink für Ihr Mitgliederbereich-Konto. Frühere Links sind nicht mehr gültig.',
    cta: 'Passwort setzen',
    expiry: 'Dieser Link funktioniert einmal und läuft in {days} Tagen ab.',
    fallback:
      'Falls die Schaltfläche nicht funktioniert, kopieren Sie diese Adresse in Ihren Browser:',
    ignore: 'Wenn Sie diese E-Mail nicht erwartet haben, können Sie sie ignorieren.',
    signoff: 'The Switzerland Chapter of ICF',
  },
  fr: {
    subject: 'Activez votre compte de l’espace membre',
    subjectResend: 'Votre nouveau lien d’activation de l’espace membre',
    preview: 'Définissez votre mot de passe et activez votre compte membre.',
    heading: 'Activez votre compte de l’espace membre',
    greeting: 'Bonjour',
    greetingPlain: 'Bonjour',
    intro:
      'Vous êtes membre de The Switzerland Chapter of ICF. Activez votre compte pour gérer votre profil et votre fiche publique dans l’annuaire.',
    resendIntro:
      'Voici un nouveau lien d’activation pour votre compte membre. Les liens précédents ne fonctionnent plus.',
    cta: 'Définir mon mot de passe',
    expiry: 'Ce lien est à usage unique et expire dans {days} jours.',
    fallback: 'Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :',
    ignore: 'Si vous n’attendiez pas cet e-mail, vous pouvez l’ignorer.',
    signoff: 'The Switzerland Chapter of ICF',
  },
  it: {
    subject: 'Attiva il tuo account dell’area soci',
    subjectResend: 'Il tuo nuovo link di attivazione dell’area soci',
    preview: 'Imposta la password e attiva il tuo account dell’area soci.',
    heading: 'Attiva il tuo account dell’area soci',
    greeting: 'Ciao',
    greetingPlain: 'Ciao',
    intro:
      'Sei membro di The Switzerland Chapter of ICF. Attiva il tuo account per gestire il tuo profilo e la tua scheda pubblica nella directory.',
    resendIntro:
      'Ecco un nuovo link di attivazione per il tuo account. I link precedenti non sono più validi.',
    cta: 'Imposta la password',
    expiry: 'Questo link è monouso e scade tra {days} giorni.',
    fallback: 'Se il pulsante non funziona, copia questo indirizzo nel browser:',
    ignore: 'Se non ti aspettavi questa e-mail, puoi ignorarla.',
    signoff: 'The Switzerland Chapter of ICF',
  },
}

function copyFor(locale?: string) {
  return COPY[(locale as ClaimLocale) in COPY ? (locale as ClaimLocale) : 'en']
}

const Email = ({
  claimUrl = 'https://coachingfederation.ch/claim',
  firstName,
  expiresInDays = 7,
  isResend = false,
  locale = 'en',
}: MemberClaimInvitationProps) => {
  const c = copyFor(locale)
  return (
    <Html lang={locale} dir="ltr">
      <Head />
      <Preview>{c['preview'] as string}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>THE SWITZERLAND CHAPTER OF ICF</Text>
          <Heading style={heading}>{c['heading']}</Heading>
          <Text style={text}>
            {firstName ? `${c['greeting']} ${firstName},` : `${c['greetingPlain']},`}
          </Text>
          <Text style={text}>{isResend ? c['resendIntro'] : c['intro']}</Text>
          <Section style={{ margin: '28px 0' }}>
            <Button style={button} href={claimUrl}>
              {c['cta']}
            </Button>
          </Section>
          <Text style={muted}>
            {(c['expiry'] as string).replace('{days}', String(expiresInDays))}
          </Text>
          <Text style={muted}>{c['fallback']}</Text>
          <Text style={urlText}>
            <Link href={claimUrl} style={{ color: '#2B379B' }}>
              {claimUrl}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={muted}>{c['ignore']}</Text>
          <Text style={muted}>{c['signoff']}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const c = copyFor(data['locale'])
    return (data['isResend'] ? c['subjectResend'] : c['subject']) as string
  },
  displayName: 'Member claim invitation',
  previewData: {
    claimUrl: 'https://coachingfederation.ch/claim/exampletoken',
    firstName: 'Anna',
    expiresInDays: 7,
    locale: 'en',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const eyebrow = {
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: '#2B379B',
  fontWeight: 700,
  margin: '0 0 12px',
}
const heading = { fontSize: '24px', color: '#212251', margin: '0 0 16px', lineHeight: '1.25' }
const text = { fontSize: '15px', color: '#212251', lineHeight: '1.6', margin: '0 0 12px' }
const muted = { fontSize: '13px', color: '#5b5f78', lineHeight: '1.6', margin: '0 0 8px' }
const urlText = { fontSize: '12px', margin: '0 0 8px', wordBreak: 'break-all' as const }
const button = {
  backgroundColor: '#2B379B',
  color: '#ffffff',
  borderRadius: '999px',
  padding: '13px 26px',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
}
const hr = { borderColor: '#e6e3dc', margin: '28px 0 16px' }
