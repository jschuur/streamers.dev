import getUnicodeFlagIcon from 'country-flag-icons/unicode';

export default function CountryFlags({ user: { country, country2 } }) {
  return (
    <div className='text-center text-xs md:text-base mt-1'>
      {country && <>{getUnicodeFlagIcon(country.toUpperCase())}</>}
      {country2 && <>{getUnicodeFlagIcon(country2.toUpperCase())}</>}
    </div>
  );
}
