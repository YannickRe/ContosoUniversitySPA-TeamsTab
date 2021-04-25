using ContosoUniversitySPA.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ContosoUniversitySPA
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(options =>
                {
                    options.TokenValidationParameters.ValidAudiences = new List<string>() { Configuration.GetSection("AzureAd").GetValue<string>("Audience"), Configuration.GetSection("AzureAd").GetValue<string>("ClientId") };
                },
                options =>
                {
                    Configuration.Bind("AzureAd", options);
                    options.AllowWebApiToBeAuthorizedByACL = true;
                })
                #region SendActivity
                .EnableTokenAcquisitionToCallDownstreamApi(options => { })
                .AddMicrosoftGraph(Configuration.GetSection("Graph"))
                .AddInMemoryTokenCaches();
                #endregion

            services.Configure<JwtBearerOptions>("AzureAd", options =>
            {
                options.TokenValidationParameters.ValidAudiences = new List<string>() { Configuration.GetSection("AzureAd").GetValue<string>("Audience"), Configuration.GetSection("AzureAd").GetValue<string>("ClientId") };
            });

            services.AddControllersWithViews();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "ContosoUniversityApi", Version = "v1" });
            });

            services.AddDbContext<SchoolContext>(options => options.UseSqlServer(Configuration.GetConnectionString("SchoolContext")));

            services.AddDatabaseDeveloperPageExceptionFilter();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ContosoUniversityApi v1"));
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.Options.PackageManagerCommand = "yarn";
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
