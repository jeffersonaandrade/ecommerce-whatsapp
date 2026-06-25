import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const settings = JSON.parse(
  fs.readFileSync(path.join(root, 'storage/store-settings.json'), 'utf8')
)
const products = JSON.parse(
  fs.readFileSync(path.join(root, 'storage/catalog.seed.json'), 'utf8')
)

function esc(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function arr(values) {
  return `ARRAY[${values.map((v) => esc(v)).join(',')}]::text[]`
}

const s = settings
const settingsSql = `INSERT INTO store_settings (
  id, store_name, description, site_url, whatsapp_phone, whatsapp_message_prefix,
  email, instagram, facebook, phone, logo_path, og_image_path,
  primary_color, secondary_color, hero_image_path,
  hero_headline, hero_headline_line2, hero_subheadline, hero_cta_label, hero_cta_href,
  about_text, address, city_state, business_hours, exchange_policy_text, updated_at
) VALUES (
  'default', ${esc(s.storeName)}, ${esc(s.description)}, ${esc(s.siteUrl)},
  ${esc(s.whatsappPhone)}, ${esc(s.whatsappMessagePrefix)}, ${esc(s.email)},
  ${esc(s.instagram)}, ${esc(s.facebook)}, ${esc(s.phone)}, ${esc(s.logoPath)},
  ${esc(s.ogImagePath)}, ${esc(s.primaryColor)}, ${esc(s.secondaryColor)},
  ${esc(s.heroImagePath)}, ${esc(s.heroHeadline)}, ${esc(s.heroHeadlineLine2)},
  ${esc(s.heroSubheadline)}, ${esc(s.heroCtaLabel)}, ${esc(s.heroCtaHref)},
  ${esc(s.aboutText)}, ${esc(s.address)}, ${esc(s.cityState)},
  ${esc(s.businessHours)}, ${esc(s.exchangePolicyText)}, ${esc(s.updatedAt)}
) ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  description = EXCLUDED.description,
  site_url = EXCLUDED.site_url,
  whatsapp_phone = EXCLUDED.whatsapp_phone,
  whatsapp_message_prefix = EXCLUDED.whatsapp_message_prefix,
  email = EXCLUDED.email,
  instagram = EXCLUDED.instagram,
  facebook = EXCLUDED.facebook,
  phone = EXCLUDED.phone,
  logo_path = EXCLUDED.logo_path,
  og_image_path = EXCLUDED.og_image_path,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  hero_image_path = EXCLUDED.hero_image_path,
  hero_headline = EXCLUDED.hero_headline,
  hero_headline_line2 = EXCLUDED.hero_headline_line2,
  hero_subheadline = EXCLUDED.hero_subheadline,
  hero_cta_label = EXCLUDED.hero_cta_label,
  hero_cta_href = EXCLUDED.hero_cta_href,
  about_text = EXCLUDED.about_text,
  address = EXCLUDED.address,
  city_state = EXCLUDED.city_state,
  business_hours = EXCLUDED.business_hours,
  exchange_policy_text = EXCLUDED.exchange_policy_text,
  updated_at = EXCLUDED.updated_at;`

let productSql = ''
for (const p of products) {
  productSql += `INSERT INTO products (
    id, slug, name, short_description, long_description, price, promotional_price,
    category, club, images, status
  ) VALUES (
    ${esc(p.id)}, ${esc(p.slug)}, ${esc(p.name)}, ${esc(p.shortDescription)},
    ${esc(p.longDescription)}, ${p.price}, ${p.promotionalPrice ?? 'NULL'},
    ${esc(p.category)}, ${esc(p.club)}, ${arr(p.images)}, ${esc(p.status)}
  ) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug, name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    long_description = EXCLUDED.long_description,
    price = EXCLUDED.price, promotional_price = EXCLUDED.promotional_price,
    category = EXCLUDED.category, club = EXCLUDED.club,
    images = EXCLUDED.images, status = EXCLUDED.status;\n`

  for (const v of p.variations) {
    productSql += `INSERT INTO product_variations (id, product_id, size, color, sku, stock)
      VALUES (${esc(v.id)}, ${esc(p.id)}, ${esc(v.size)}, ${esc(v.color)}, ${esc(v.sku)}, ${v.stock})
      ON CONFLICT (id) DO UPDATE SET
        product_id = EXCLUDED.product_id, size = EXCLUDED.size,
        color = EXCLUDED.color, sku = EXCLUDED.sku, stock = EXCLUDED.stock;\n`
  }
}

const outPath = path.join(root, 'scripts', '_seed-supabase.sql')
fs.writeFileSync(outPath, `${settingsSql}\n${productSql}`)
console.log(`Wrote ${outPath} (${products.length} products)`)
