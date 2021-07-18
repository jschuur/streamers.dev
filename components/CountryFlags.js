import getUnicodeFlagIcon from 'country-flag-icons/unicode';

export default function CountryFlags({ channel: { country, country2 } }) {
  const countries = [country, country2].filter(Boolean);

  return countries.map((country) => (
    <span key={country} className='m-1'>
      {getUnicodeFlagIcon(country.toUpperCase())}
    </span>
  ));
}