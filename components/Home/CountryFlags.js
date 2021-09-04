import ReactCountryFlag from 'react-country-flag';

export default function CountryFlags({ channel: { country, country2 } }) {
  const countries = [country, country2].filter(Boolean);

  return countries.map((country) => (
    <span key={country} className='m-1'>
      <ReactCountryFlag countryCode={country.toUpperCase()} svg />
    </span>
  ));
}
