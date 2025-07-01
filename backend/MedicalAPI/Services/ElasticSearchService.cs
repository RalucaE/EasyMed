using Elasticsearch.Net;
using Nest;

namespace MedicalAPI.Services
{
    public class ElasticSearchService
    {
        private readonly ElasticClient _client;

        public ElasticSearchService(string uri, string username, string password)
        {
            if (string.IsNullOrWhiteSpace(uri))
            {
                throw new ArgumentNullException(nameof(uri), "Elasticsearch URI cannot be null or empty.");
            }
            var settings = new ConnectionSettings(new Uri(uri))
                .DefaultIndex("pdf_data") // Default index name
                .BasicAuthentication(username, password)
                .ServerCertificateValidationCallback(CertificateValidations.AllowAll);

            _client = new ElasticClient(settings);

            var createIndexResponse = _client.Indices.Create("disease_data", c => c
                .Map(m => m.AutoMap())
            );

            try
            {
                var pingResponse = _client.Ping();
                if (!pingResponse.IsValid)
                {
                    throw new InvalidOperationException("Unable to connect to Elasticsearch: " + pingResponse.DebugInformation);
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Elasticsearch initialization failed: " + ex.Message, ex);
            }
        }

        public ElasticClient Client => _client;
    }
}