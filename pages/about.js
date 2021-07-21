import Layout from '../components/Layout/Layout';
import Section from '../components/Layout/Section';

export default function AboutPage() {
  return (
    <Layout page='About' description='All about streamers.dev'>
      <Section>
        <div className='py-4 px-4'>
          <i>
            Finding live coding streams for your favorite tech stack shouldn't mean{' '}
            <a href='https://www.twitch.tv/directory/game/Science%20%26%20Technology'>
              weeding through
            </a>{' '}
            a bunch of animal channels...
          </i>
        </div>
      </Section>
    </Layout>
  );
}
