import getUnicodeFlagIcon from 'country-flag-icons/unicode';

export default function CountryFlags({ channel: { country, country2 } }) {
  return (
    <div className='text-center text-sm md:text-base mt-1'>
      {country && <>{getUnicodeFlagIcon(country.toUpperCase())}</>}
      {country2 && <>{getUnicodeFlagIcon(country2.toUpperCase())}</>}
    </div>
  );
}
