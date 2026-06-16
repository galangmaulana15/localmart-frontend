import { Link } from 'react-router-dom'
import { Camera, Mail, MapPin, Phone, ShieldCheck, User, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { mergeUserProfile, saveProfile } from '../utils/demoStore'
import { useToast } from '../components/ui/useToast'

const roleLabel = {
  2: 'Seller',
  3: 'Customer',
}

const validateProfile = (profile) => {
  const errors = {}
  const phone = profile.phone.replace(/\D/g, '')
  const postalCode = profile.postal_code.replace(/\D/g, '')

  if (profile.full_name.trim().length < 3) errors.full_name = 'Nama minimal 3 karakter'
  if (!/^\d{10,13}$/.test(phone)) errors.phone = 'Nomor HP harus 10-13 digit'
  if (profile.address.trim().length < 15) errors.address = 'Alamat minimal 15 karakter'
  if (profile.city.trim().length < 3) errors.city = 'Kota minimal 3 karakter'
  if (profile.province.trim().length < 3) errors.province = 'Provinsi minimal 3 karakter'
  if (!/^\d{5}$/.test(postalCode)) errors.postal_code = 'Kode pos harus 5 digit'

  return errors
}

export default function ProfilePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(() => mergeUserProfile(user))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    queueMicrotask(() => {
      setProfile(mergeUserProfile(user))
      setErrors({})
    })
  }, [user])

  const displayProfile = useMemo(() => ({
    name: profile.full_name || user?.full_name || user?.name || 'User LocalMart',
    email: profile.email || user?.email || '',
    phone: profile.phone || '',
    address: profile.address || '',
    city: profile.city || '',
    province: profile.province || '',
    postal_code: profile.postal_code || '',
    avatar: profile.avatar || '',
  }), [profile, user])

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateProfile('avatar', String(reader.result || ''))
    }
    reader.readAsDataURL(file)
  }

  const clearAvatar = () => {
    updateProfile('avatar', '')
  }

  const handleSave = (event) => {
    event.preventDefault()
    const nextErrors = validateProfile(profile)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    const nextProfile = {
      ...profile,
      full_name: profile.full_name.trim(),
      phone: profile.phone.replace(/\D/g, ''),
      address: profile.address.trim(),
      city: profile.city.trim(),
      province: profile.province.trim(),
      postal_code: profile.postal_code.replace(/\D/g, ''),
    }

    saveProfile(user, nextProfile)
    setProfile(nextProfile)
    toast.success('Profile berhasil disimpan')
  }

  return (
    <div className="bg-light min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Profile</h1>
          <p className="text-gray-500">Data akun dan pengiriman untuk checkout LocalMart.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="panel rounded-3xl p-8 text-center h-fit">
              <div className="mx-auto mb-4 h-28 w-28 rounded-full border-4 border-white bg-gradient-to-br from-primary to-accent p-1 shadow-xl">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                  {displayProfile.avatar ? (
                    <img
                      src={displayProfile.avatar}
                      alt={displayProfile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
                      <UserRound className="h-14 w-14" />
                    </div>
                  )}
                </div>
              </div>
            <h2 className="text-2xl font-bold text-secondary">{displayProfile.name}</h2>
            <p className="text-gray-500">{roleLabel[user?.role_id] || 'User'}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-secondary hover:border-primary hover:text-primary">
                <Camera className="h-4 w-4" />
                Ganti Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              {displayProfile.avatar && (
                <button type="button" onClick={clearAvatar} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-600">
                  Hapus
                </button>
              )}
            </div>
            <div className="mt-6 space-y-3 text-left">
              <ProfileSummary icon={User} label="Nama" value={displayProfile.name} />
              <ProfileSummary icon={Mail} label="Email" value={displayProfile.email || '-'} />
              <ProfileSummary icon={Phone} label="Phone" value={displayProfile.phone || '-'} />
              <ProfileSummary icon={MapPin} label="Alamat" value={displayProfile.address || '-'} />
            </div>
            </section>

          <section className="lg:col-span-2 panel rounded-3xl p-8">
            <h2 className="text-xl font-bold text-secondary mb-5">Edit Profile Customer</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <ProfileField icon={User} label="Nama" error={errors.full_name}>
                <input value={profile.full_name} onChange={(event) => updateProfile('full_name', event.target.value)} className="w-full bg-transparent outline-none font-semibold text-secondary" />
              </ProfileField>
              <ProfileField icon={Camera} label="Foto Profile">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
                />
              </ProfileField>
              <ProfileField icon={Mail} label="Email">
                <input value={profile.email} disabled className="w-full bg-transparent outline-none font-semibold text-secondary disabled:text-gray-500" />
              </ProfileField>
              <ProfileField icon={Phone} label="Telepon" error={errors.phone}>
                <input value={profile.phone} onChange={(event) => updateProfile('phone', event.target.value)} className="w-full bg-transparent outline-none font-semibold text-secondary" placeholder="081234567890" />
              </ProfileField>
              <ProfileField icon={MapPin} label="Alamat" error={errors.address}>
                <textarea value={profile.address} onChange={(event) => updateProfile('address', event.target.value)} className="w-full bg-transparent outline-none font-semibold text-secondary" rows={3} placeholder="Alamat lengkap minimal 15 karakter" />
              </ProfileField>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FieldInput value={profile.city} onChange={(value) => updateProfile('city', value)} placeholder="Kota/Kabupaten" error={errors.city} />
                <FieldInput value={profile.province} onChange={(value) => updateProfile('province', value)} placeholder="Provinsi" error={errors.province} />
                <FieldInput value={profile.postal_code} onChange={(value) => updateProfile('postal_code', value)} placeholder="Kode Pos" error={errors.postal_code} inputMode="numeric" />
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-700">Akun aktif. Data pengiriman ini digunakan untuk mempercepat checkout.</p>
              </div>
              <button className="gradient-bg text-white rounded-xl px-5 py-3 font-semibold">Simpan Profile</button>
            </form>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/wallet" className="border border-gray-200 rounded-xl px-5 py-3 font-semibold text-center hover:bg-gray-50 transition">
                Buka Wallet
              </Link>
              <Link to="/my-orders" className="border border-gray-200 rounded-xl px-5 py-3 font-semibold text-center hover:bg-gray-50 transition">
                Lihat Pesanan
              </Link>
            </div>
          </section>


        </div>
      </div>
    </div>
  )
}

export function ProfileField({ icon: Icon, label, error, children }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
      <Icon className="mt-1 h-5 w-5 text-primary" />
      <div className="flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        {children}
        {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
      </div>
    </label>
  )
}

function ProfileSummary({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-secondary break-words">{value}</p>
      </div>
    </div>
  )
}

function FieldInput({ value, onChange, placeholder, error, inputMode = 'text' }) {
  return (
    <label className="block rounded-2xl bg-gray-50 p-4">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent outline-none"
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </label>
  )
}
